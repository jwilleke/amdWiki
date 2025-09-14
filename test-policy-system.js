const WikiEngine = require('./src/WikiEngine');

/**
 * Test script for Policy-Based Access Control
 * Tests the integration of PolicyManager, PolicyEvaluator, and PolicyValidator
 */
async function testPolicySystem() {
  console.log('🧪 Starting Policy System Tests...\n');

  try {
    // Create and initialize the WikiEngine
    console.log('1. Initializing WikiEngine...');
    const engine = await WikiEngine.createDefault({
      accessControl: {
        policies: {
          enabled: true
        }
      }
    });

    // Get policy managers
    const policyManager = engine.getManager('PolicyManager');
    const policyEvaluator = engine.getManager('PolicyEvaluator');
    const policyValidator = engine.getManager('PolicyValidator');
    const aclManager = engine.getManager('ACLManager');

    console.log('✅ All managers initialized successfully\n');

    // Test 1: Create a test policy
    console.log('2. Creating test policy...');
    const testPolicy = {
      id: 'test-policy-allow-editors',
      name: 'Test Policy - Allow Editors',
      description: 'Allows editor role to edit pages',
      priority: 100,
      effect: 'allow',
      subjects: [
        { type: 'role', value: 'editor' }
      ],
      resources: [
        { type: 'page', pattern: '*' }
      ],
      actions: ['view', 'edit'],
      conditions: [],
      metadata: {
        created: new Date().toISOString(),
        author: 'test-system',
        tags: ['test', 'editor']
      }
    };

    const savedPolicy = await policyManager.savePolicy(testPolicy);
    console.log('✅ Test policy created:', savedPolicy.id);

    // Test 2: Validate the policy
    console.log('\n3. Validating policy...');
    const validation = policyValidator.validatePolicy(savedPolicy);
    console.log('✅ Policy validation result:', validation.isValid ? 'VALID' : 'INVALID');
    if (validation.errors.length > 0) {
      console.log('❌ Validation errors:', validation.errors);
    }

    // Test 3: Test policy evaluation
    console.log('\n4. Testing policy evaluation...');

    // Test case 1: Editor user accessing a page for editing
    const editorContext = {
      user: {
        username: 'test-editor',
        roles: ['editor'],
        isAuthenticated: true
      },
      resource: 'TestPage',
      action: 'edit',
      category: 'General',
      tags: [],
      ip: '192.168.1.100',
      userAgent: 'TestBrowser/1.0',
      timestamp: new Date().toISOString(),
      session: {},
      environment: 'test'
    };

    const editorResult = await policyEvaluator.evaluateAccess(editorContext);
    console.log('✅ Editor edit access result:', editorResult.allowed ? 'ALLOWED' : 'DENIED');
    console.log('   Reason:', editorResult.reason);

    // Test case 2: Anonymous user accessing a page for editing
    const anonymousContext = {
      user: null,
      resource: 'TestPage',
      action: 'edit',
      category: 'General',
      tags: [],
      ip: '192.168.1.101',
      userAgent: 'TestBrowser/1.0',
      timestamp: new Date().toISOString(),
      session: {},
      environment: 'test'
    };

    const anonymousResult = await policyEvaluator.evaluateAccess(anonymousContext);
    console.log('✅ Anonymous edit access result:', anonymousResult.allowed ? 'ALLOWED' : 'DENIED');
    console.log('   Reason:', anonymousResult.reason);

    // Test case 3: Editor user accessing a page for viewing
    const viewContext = {
      ...editorContext,
      action: 'view'
    };

    const viewResult = await policyEvaluator.evaluateAccess(viewContext);
    console.log('✅ Editor view access result:', viewResult.allowed ? 'ALLOWED' : 'DENIED');
    console.log('   Reason:', viewResult.reason);

    // Test 4: Test ACLManager integration
    console.log('\n5. Testing ACLManager integration...');

    const aclResult = await aclManager.checkPagePermission(
      'TestPage',
      'edit',
      editorContext.user,
      '# Test Page Content\n\nThis is a test page.',
      {
        ip: editorContext.ip,
        userAgent: editorContext.userAgent
      }
    );

    console.log('✅ ACLManager with policy integration result:', aclResult ? 'ALLOWED' : 'DENIED');

    // Test 5: Create a deny policy with higher priority
    console.log('\n6. Testing policy priority and conflicts...');
    const denyPolicy = {
      id: 'test-policy-deny-system-pages',
      name: 'Test Policy - Deny System Pages',
      description: 'Denies access to system pages',
      priority: 200, // Higher priority
      effect: 'deny',
      subjects: [
        { type: 'role', value: 'editor' }
      ],
      resources: [
        { type: 'page', pattern: 'System*' }
      ],
      actions: ['edit'],
      conditions: [],
      metadata: {
        created: new Date().toISOString(),
        author: 'test-system',
        tags: ['test', 'system']
      }
    };

    await policyManager.savePolicy(denyPolicy);
    console.log('✅ High-priority deny policy created');

    // Test the deny policy
    const systemPageContext = {
      ...editorContext,
      resource: 'SystemConfig'
    };

    const denyResult = await policyEvaluator.evaluateAccess(systemPageContext);
    console.log('✅ System page access result:', denyResult.allowed ? 'ALLOWED' : 'DENIED');
    console.log('   Reason:', denyResult.reason);

    // Test 6: Validate all policies
    console.log('\n7. Validating all policies...');
    const allPolicies = policyManager.getPolicies();
    const allValidation = policyValidator.validateAllPolicies(allPolicies);
    console.log('✅ All policies validation:', allValidation.isValid ? 'VALID' : 'INVALID');
    console.log('   Total policies:', allPolicies.length);
    console.log('   Valid policies:', allValidation.summary.validPolicies);
    console.log('   Conflicts:', allValidation.summary.conflicts);

    // Test 7: Get policy statistics
    console.log('\n8. Policy system statistics...');
    const stats = policyManager.getStatistics();
    console.log('✅ Policy statistics:');
    console.log('   Total policies:', stats.totalPolicies);
    console.log('   Allow policies:', stats.allowPolicies);
    console.log('   Deny policies:', stats.denyPolicies);
    console.log('   Average priority:', Math.round(stats.averagePriority));
    console.log('   Cache size:', stats.cacheSize);

    const evalStats = policyEvaluator.getStatistics();
    console.log('✅ Evaluation statistics:');
    console.log('   Cache size:', evalStats.cacheStats.size);
    console.log('   Cache max size:', evalStats.cacheStats.maxSize);

    console.log('\n🎉 All Policy System Tests Completed Successfully!');

    // Cleanup: Remove test policies
    console.log('\n🧹 Cleaning up test policies...');
    await policyManager.deletePolicy('test-policy-allow-editors');
    await policyManager.deletePolicy('test-policy-deny-system-pages');
    console.log('✅ Test policies cleaned up');

  } catch (error) {
    console.error('❌ Policy System Test Failed:', error);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Run the tests
if (require.main === module) {
  testPolicySystem().then(() => {
    console.log('\n🏁 Test script completed');
    process.exit(0);
  }).catch((error) => {
    console.error('\n💥 Test script failed:', error);
    process.exit(1);
  });
}

module.exports = { testPolicySystem };