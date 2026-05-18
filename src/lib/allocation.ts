import mongoose from 'mongoose';
import Provider, { IProvider } from '@/models/Provider';
import LeadAssignment from '@/models/LeadAssignment';
import AllocationState from '@/models/AllocationState';
import { ILead } from '@/models/Lead';

const MANDATORY_PROVIDERS: Record<string, string[]> = {
  'Service 1': ['Provider 1'],
  'Service 2': ['Provider 5'],
  'Service 3': ['Provider 1', 'Provider 4'],
};

const POOLS: Record<string, string[]> = {
  'Service 1': ['Provider 2', 'Provider 3', 'Provider 4'],
  'Service 2': ['Provider 6', 'Provider 7', 'Provider 8'],
  'Service 3': ['Provider 2', 'Provider 3', 'Provider 5', 'Provider 6', 'Provider 7', 'Provider 8'],
};

export async function allocateLead(lead: ILead, session: mongoose.ClientSession) {
  const serviceType = lead.serviceType;
  const mandatoryNames = MANDATORY_PROVIDERS[serviceType] || [];
  const poolNames = POOLS[serviceType] || [];
  
  const providersToAssign: IProvider[] = [];

  // Fetch all providers for this service that have available quota
  // We use lean() for performance, but need full docs if we were modifying them directly.
  // Instead, we will do bulk updates later.
  const eligibleMandatory = await Provider.find({
    name: { $in: mandatoryNames },
    usedQuota: { $lt: 10 }, // Assuming quota is 10
    $expr: { $lt: ['$usedQuota', '$monthlyQuota'] }
  }).session(session);

  providersToAssign.push(...eligibleMandatory);

  // If we need more providers to reach 3
  if (providersToAssign.length < 3) {
    const needed = 3 - providersToAssign.length;
    let allocationState = await AllocationState.findOne({ serviceType }).session(session);
    
    if (!allocationState) {
      // In case it wasn't seeded
      allocationState = new AllocationState({ serviceType, currentIndex: 0 });
      await allocationState.save({ session });
    }

    const poolProviders = await Provider.find({
      name: { $in: poolNames },
      $expr: { $lt: ['$usedQuota', '$monthlyQuota'] }
    }).session(session);

    // Sort pool providers to match the order in POOLS array for predictable round robin
    poolProviders.sort((a, b) => poolNames.indexOf(a.name) - poolNames.indexOf(b.name));

    if (poolProviders.length > 0) {
      let currentIndex = allocationState.currentIndex;
      let assignedCount = 0;
      let loopCount = 0; // Prevent infinite loop if all quotas are full (though filtered out above)

      while (assignedCount < needed && loopCount < poolProviders.length) {
        const providerIndex = currentIndex % poolProviders.length;
        const selectedProvider = poolProviders[providerIndex];
        
        // Ensure we don't assign to the same provider twice
        if (!providersToAssign.find(p => p.id === selectedProvider.id)) {
          providersToAssign.push(selectedProvider);
          assignedCount++;
        }
        
        currentIndex++;
        loopCount++;
      }

      // Update state
      allocationState.currentIndex = currentIndex;
      await allocationState.save({ session });
    }
  }

  if (providersToAssign.length > 0) {
    const providerIds = providersToAssign.map(p => p._id);

    // Increment quotas atomically while strictly checking limits
    const updateResult = await Provider.updateMany(
      { _id: { $in: providerIds }, $expr: { $lt: ['$usedQuota', '$monthlyQuota'] } },
      { $inc: { usedQuota: 1 } }
    ).session(session);

    if (updateResult.modifiedCount !== providerIds.length) {
      throw new Error('Concurrency Quota Overflow: A selected provider reached its quota during transaction.');
    }

    // Create assignments
    const assignments = providersToAssign.map(p => ({
      leadId: lead._id,
      providerId: p._id,
      assignedAt: new Date()
    }));
    await LeadAssignment.insertMany(assignments, { session });
  }

  return providersToAssign;
}
