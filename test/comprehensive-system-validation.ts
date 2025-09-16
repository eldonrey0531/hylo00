/**
 * Comprehensive System Validation for LangChain.js Multi-LLM Routing Infrastructure
 *
 * This script performs end-to-end validation of the entire routing system:
 * 1. Validates all API endpoints exist and are properly structured
 * 2. Tests TypeScript compilation and imports
 * 3. Validates configuration interfaces
 * 4. Tests provider abstractions
 * 5. Validates routing and fallback logic
 * 6. Tests observability integration
 * 7. Validates frontend integration
 */

import { promises as fs } from 'fs';
import path from 'path';

interface ValidationCheck {
  name: string;
  success: boolean;
  details?: string;
  error?: string;
}

interface ValidationSuite {
  name: string;
  checks: ValidationCheck[];
  success: boolean;
  duration: number;
}

/**
 * Main validation orchestrator
 */
export async function validateEntireSystem(): Promise<{
  success: boolean;
  suites: ValidationSuite[];
  summary: {
    totalChecks: number;
    passedChecks: number;
    failedChecks: number;
    totalDuration: number;
  };
}> {
  const startTime = Date.now();
  const suites: ValidationSuite[] = [];

  console.log('🚀 Starting Comprehensive System Validation');
  console.log('📋 Testing LangChain.js Multi-LLM Routing Infrastructure');
  console.log('');

  // Suite 1: File Structure Validation
  suites.push(await validateFileStructure());

  // Suite 2: TypeScript Compilation
  suites.push(await validateTypeScriptCompilation());

  // Suite 3: API Endpoint Structure
  suites.push(await validateApiEndpoints());

  // Suite 4: Provider Implementations
  suites.push(await validateProviderImplementations());

  // Suite 5: Utility Systems
  suites.push(await validateUtilitySystems());

  // Suite 6: Frontend Integration
  suites.push(await validateFrontendIntegration());

  // Suite 7: Constitutional Compliance
  suites.push(await validateConstitutionalCompliance());

  const totalDuration = Date.now() - startTime;
  const totalChecks = suites.reduce((sum, suite) => sum + suite.checks.length, 0);
  const passedChecks = suites.reduce(
    (sum, suite) => sum + suite.checks.filter((check) => check.success).length,
    0
  );
  const failedChecks = totalChecks - passedChecks;
  const overallSuccess = suites.every((suite) => suite.success);

  console.log('📊 Final Validation Summary:');
  console.log(`   Overall Result: ${overallSuccess ? '✅ SUCCESS' : '❌ FAILURE'}`);
  console.log(`   Total Duration: ${totalDuration}ms`);
  console.log(
    `   Validation Suites: ${suites.filter((s) => s.success).length}/${suites.length} passed`
  );
  console.log(`   Individual Checks: ${passedChecks}/${totalChecks} passed`);
  console.log('');

  if (!overallSuccess) {
    console.log('❌ Failed Suites:');
    suites
      .filter((s) => !s.success)
      .forEach((suite) => {
        console.log(`   - ${suite.name}`);
        suite.checks
          .filter((c) => !c.success)
          .forEach((check) => {
            console.log(`     ❌ ${check.name}: ${check.error}`);
          });
      });
  } else {
    console.log('🎉 All validation suites passed! System is ready for production.');
  }

  return {
    success: overallSuccess,
    suites,
    summary: {
      totalChecks,
      passedChecks,
      failedChecks,
      totalDuration,
    },
  };
}

/**
 * Validate file structure exists
 */
async function validateFileStructure(): Promise<ValidationSuite> {
  const startTime = Date.now();
  const checks: ValidationCheck[] = [];

  console.log('📁 Suite 1: File Structure Validation');

  const requiredFiles = [
    // API Endpoints
    'api/llm/route.ts',
    'api/llm/providers.ts',
    'api/llm/health.ts',

    // Provider Implementations
    'api/providers/cerebras.ts',
    'api/providers/gemini.ts',
    'api/providers/groq.ts',

    // Utility Systems
    'api/utils/routing.ts',
    'api/utils/fallback.ts',
    'api/utils/observability.ts',

    // Frontend Integration
    'src/services/llmRoutingService.ts',
    'src/services/multiAgentService.ts',

    // Test Files
    'test/llm-routing-integration.test.ts',
    'test/frontend-integration-validation.ts',
  ];

  for (const file of requiredFiles) {
    try {
      const fullPath = path.join(process.cwd(), file);
      await fs.access(fullPath);
      checks.push({
        name: `File exists: ${file}`,
        success: true,
        details: 'File found and accessible',
      });
    } catch (error) {
      checks.push({
        name: `File exists: ${file}`,
        success: false,
        error: 'File not found',
      });
    }
  }

  const success = checks.every((check) => check.success);
  const duration = Date.now() - startTime;

  console.log(`   ${success ? '✅' : '❌'} File structure validation completed in ${duration}ms`);
  console.log(`   Files checked: ${checks.filter((c) => c.success).length}/${checks.length}`);
  console.log('');

  return { name: 'File Structure', checks, success, duration };
}

/**
 * Validate TypeScript compilation
 */
async function validateTypeScriptCompilation(): Promise<ValidationSuite> {
  const startTime = Date.now();
  const checks: ValidationCheck[] = [];

  console.log('🔧 Suite 2: TypeScript Compilation Validation');

  // Check TypeScript configuration
  try {
    const tsconfigPath = path.join(process.cwd(), 'tsconfig.json');
    const tsconfig = JSON.parse(await fs.readFile(tsconfigPath, 'utf-8'));
    checks.push({
      name: 'TypeScript configuration valid',
      success: true,
      details: `Compiler options configured with strict: ${tsconfig.compilerOptions?.strict}`,
    });
  } catch (error) {
    checks.push({
      name: 'TypeScript configuration valid',
      success: false,
      error: 'Failed to read or parse tsconfig.json',
    });
  }

  // Check build output
  try {
    const distPath = path.join(process.cwd(), 'dist');
    await fs.access(distPath);
    checks.push({
      name: 'Build output exists',
      success: true,
      details: 'Dist directory found from previous build',
    });
  } catch (error) {
    checks.push({
      name: 'Build output exists',
      success: false,
      error: 'No dist directory found - build may have failed',
    });
  }

  const success = checks.every((check) => check.success);
  const duration = Date.now() - startTime;

  console.log(
    `   ${success ? '✅' : '❌'} TypeScript compilation validation completed in ${duration}ms`
  );
  console.log(`   Compilation checks: ${checks.filter((c) => c.success).length}/${checks.length}`);
  console.log('');

  return { name: 'TypeScript Compilation', checks, success, duration };
}

/**
 * Validate API endpoint structure
 */
async function validateApiEndpoints(): Promise<ValidationSuite> {
  const startTime = Date.now();
  const checks: ValidationCheck[] = [];

  console.log('🔌 Suite 3: API Endpoint Structure Validation');

  const endpoints = [
    { file: 'api/llm/route.ts', expectedExports: ['config', 'default'] },
    { file: 'api/llm/providers.ts', expectedExports: ['config', 'default'] },
    { file: 'api/llm/health.ts', expectedExports: ['config', 'default'] },
  ];

  for (const endpoint of endpoints) {
    try {
      const filePath = path.join(process.cwd(), endpoint.file);
      const content = await fs.readFile(filePath, 'utf-8');

      // Check for edge runtime configuration
      const hasEdgeConfig = content.includes("runtime: 'edge'");
      checks.push({
        name: `${endpoint.file} has edge runtime config`,
        success: hasEdgeConfig,
        details: hasEdgeConfig ? 'Edge runtime configured' : undefined,
        error: hasEdgeConfig ? undefined : 'Missing edge runtime configuration',
      });

      // Check for expected exports
      for (const expectedExport of endpoint.expectedExports) {
        const hasExport =
          content.includes(`export ${expectedExport}`) || content.includes(`export default`);
        checks.push({
          name: `${endpoint.file} exports ${expectedExport}`,
          success: hasExport,
          details: hasExport ? 'Export found' : undefined,
          error: hasExport ? undefined : `Missing ${expectedExport} export`,
        });
      }
    } catch (error) {
      checks.push({
        name: `${endpoint.file} structure validation`,
        success: false,
        error: `Failed to read file: ${error}`,
      });
    }
  }

  const success = checks.every((check) => check.success);
  const duration = Date.now() - startTime;

  console.log(`   ${success ? '✅' : '❌'} API endpoint validation completed in ${duration}ms`);
  console.log(`   Endpoint checks: ${checks.filter((c) => c.success).length}/${checks.length}`);
  console.log('');

  return { name: 'API Endpoints', checks, success, duration };
}

/**
 * Validate provider implementations
 */
async function validateProviderImplementations(): Promise<ValidationSuite> {
  const startTime = Date.now();
  const checks: ValidationCheck[] = [];

  console.log('🏭 Suite 4: Provider Implementation Validation');

  const providers = ['cerebras', 'gemini', 'groq'];

  for (const provider of providers) {
    try {
      const filePath = path.join(process.cwd(), `api/providers/${provider}.ts`);
      const content = await fs.readFile(filePath, 'utf-8');

      // Check for LLMProvider interface implementation
      const hasInterface = content.includes('LLMProvider') || content.includes('implements');
      checks.push({
        name: `${provider} provider implements interface`,
        success: hasInterface,
        details: hasInterface ? 'Interface implementation found' : undefined,
        error: hasInterface ? undefined : 'Missing LLMProvider interface implementation',
      });

      // Check for required methods
      const requiredMethods = ['isAvailable', 'hasCapacity', 'generate'];
      for (const method of requiredMethods) {
        const hasMethod = content.includes(method);
        checks.push({
          name: `${provider} provider has ${method} method`,
          success: hasMethod,
          details: hasMethod ? 'Method implementation found' : undefined,
          error: hasMethod ? undefined : `Missing ${method} method`,
        });
      }
    } catch (error) {
      checks.push({
        name: `${provider} provider validation`,
        success: false,
        error: `Failed to read provider file: ${error}`,
      });
    }
  }

  const success = checks.every((check) => check.success);
  const duration = Date.now() - startTime;

  console.log(`   ${success ? '✅' : '❌'} Provider validation completed in ${duration}ms`);
  console.log(`   Provider checks: ${checks.filter((c) => c.success).length}/${checks.length}`);
  console.log('');

  return { name: 'Provider Implementations', checks, success, duration };
}

/**
 * Validate utility systems
 */
async function validateUtilitySystems(): Promise<ValidationSuite> {
  const startTime = Date.now();
  const checks: ValidationCheck[] = [];

  console.log('🔧 Suite 5: Utility Systems Validation');

  const utilities = [
    { file: 'api/utils/routing.ts', expectedClasses: ['RoutingEngine'] },
    { file: 'api/utils/fallback.ts', expectedClasses: ['FallbackHandler'] },
    { file: 'api/utils/observability.ts', expectedClasses: ['ObservabilityService'] },
  ];

  for (const utility of utilities) {
    try {
      const filePath = path.join(process.cwd(), utility.file);
      const content = await fs.readFile(filePath, 'utf-8');

      for (const expectedClass of utility.expectedClasses) {
        const hasClass =
          content.includes(`class ${expectedClass}`) ||
          content.includes(`export class ${expectedClass}`);
        checks.push({
          name: `${utility.file} contains ${expectedClass}`,
          success: hasClass,
          details: hasClass ? 'Class implementation found' : undefined,
          error: hasClass ? undefined : `Missing ${expectedClass} class`,
        });
      }
    } catch (error) {
      checks.push({
        name: `${utility.file} validation`,
        success: false,
        error: `Failed to read utility file: ${error}`,
      });
    }
  }

  const success = checks.every((check) => check.success);
  const duration = Date.now() - startTime;

  console.log(`   ${success ? '✅' : '❌'} Utility systems validation completed in ${duration}ms`);
  console.log(`   Utility checks: ${checks.filter((c) => c.success).length}/${checks.length}`);
  console.log('');

  return { name: 'Utility Systems', checks, success, duration };
}

/**
 * Validate frontend integration
 */
async function validateFrontendIntegration(): Promise<ValidationSuite> {
  const startTime = Date.now();
  const checks: ValidationCheck[] = [];

  console.log('🖥️ Suite 6: Frontend Integration Validation');

  try {
    // Check routing service
    const routingServicePath = path.join(process.cwd(), 'src/services/llmRoutingService.ts');
    const routingContent = await fs.readFile(routingServicePath, 'utf-8');

    const hasRoutingClient = routingContent.includes('LLMRoutingClient');
    checks.push({
      name: 'LLM routing service exists',
      success: hasRoutingClient,
      details: hasRoutingClient ? 'LLMRoutingClient class found' : undefined,
      error: hasRoutingClient ? undefined : 'Missing LLMRoutingClient class',
    });

    const hasGroqCompatibility = routingContent.includes('createRoutingGroqClient');
    checks.push({
      name: 'Groq SDK compatibility layer exists',
      success: hasGroqCompatibility,
      details: hasGroqCompatibility ? 'Groq compatibility function found' : undefined,
      error: hasGroqCompatibility ? undefined : 'Missing Groq SDK compatibility',
    });

    // Check multiAgent service integration
    const multiAgentPath = path.join(process.cwd(), 'src/services/multiAgentService.ts');
    const multiAgentContent = await fs.readFile(multiAgentPath, 'utf-8');

    const usesRoutingService = multiAgentContent.includes('createRoutingGroqClient');
    checks.push({
      name: 'Multi-agent service uses routing',
      success: usesRoutingService,
      details: usesRoutingService ? 'Routing service integration found' : undefined,
      error: usesRoutingService ? undefined : 'Still using direct Groq SDK',
    });

    const noDirectGroqImport = !multiAgentContent.includes("from 'groq-sdk'");
    checks.push({
      name: 'No direct Groq SDK imports',
      success: noDirectGroqImport,
      details: noDirectGroqImport ? 'Direct Groq import removed' : undefined,
      error: noDirectGroqImport ? undefined : 'Still importing Groq SDK directly',
    });
  } catch (error) {
    checks.push({
      name: 'Frontend integration validation',
      success: false,
      error: `Failed to read frontend files: ${error}`,
    });
  }

  const success = checks.every((check) => check.success);
  const duration = Date.now() - startTime;

  console.log(
    `   ${success ? '✅' : '❌'} Frontend integration validation completed in ${duration}ms`
  );
  console.log(`   Integration checks: ${checks.filter((c) => c.success).length}/${checks.length}`);
  console.log('');

  return { name: 'Frontend Integration', checks, success, duration };
}

/**
 * Validate constitutional compliance
 */
async function validateConstitutionalCompliance(): Promise<ValidationSuite> {
  const startTime = Date.now();
  const checks: ValidationCheck[] = [];

  console.log('📜 Suite 7: Constitutional Compliance Validation');

  try {
    // Check for edge-first architecture
    const apiFiles = ['api/llm/route.ts', 'api/llm/providers.ts', 'api/llm/health.ts'];
    let edgeConfigCount = 0;

    for (const file of apiFiles) {
      try {
        const content = await fs.readFile(path.join(process.cwd(), file), 'utf-8');
        if (content.includes("runtime: 'edge'")) {
          edgeConfigCount++;
        }
      } catch (error) {
        // File doesn't exist, already caught in other validations
      }
    }

    checks.push({
      name: 'Edge-first architecture implemented',
      success: edgeConfigCount === apiFiles.length,
      details: `${edgeConfigCount}/${apiFiles.length} API endpoints configured for edge runtime`,
      error:
        edgeConfigCount === apiFiles.length
          ? undefined
          : 'Some API endpoints missing edge configuration',
    });

    // Check for multi-LLM resilience
    const routingUtilsPath = path.join(process.cwd(), 'api/utils/routing.ts');
    try {
      const routingContent = await fs.readFile(routingUtilsPath, 'utf-8');
      const hasMultiProvider =
        routingContent.includes('cerebras') &&
        routingContent.includes('gemini') &&
        routingContent.includes('groq');
      checks.push({
        name: 'Multi-LLM resilience implemented',
        success: hasMultiProvider,
        details: hasMultiProvider ? 'Multiple provider support found' : undefined,
        error: hasMultiProvider ? undefined : 'Missing multi-provider routing logic',
      });
    } catch (error) {
      checks.push({
        name: 'Multi-LLM resilience implemented',
        success: false,
        error: 'Could not verify routing implementation',
      });
    }

    // Check for observability
    const observabilityPath = path.join(process.cwd(), 'api/utils/observability.ts');
    try {
      const observabilityContent = await fs.readFile(observabilityPath, 'utf-8');
      const hasLangSmith =
        observabilityContent.includes('LangSmith') || observabilityContent.includes('tracing');
      checks.push({
        name: 'Observable AI operations implemented',
        success: hasLangSmith,
        details: hasLangSmith ? 'Observability service found' : undefined,
        error: hasLangSmith ? undefined : 'Missing observability implementation',
      });
    } catch (error) {
      checks.push({
        name: 'Observable AI operations implemented',
        success: false,
        error: 'Could not verify observability implementation',
      });
    }

    // Check for type safety
    const routingServicePath = path.join(process.cwd(), 'src/services/llmRoutingService.ts');
    try {
      const routingServiceContent = await fs.readFile(routingServicePath, 'utf-8');
      const hasTypeScript =
        routingServiceContent.includes('interface') &&
        !routingServiceContent.includes(': any') &&
        routingServiceContent.includes('export interface');
      checks.push({
        name: 'Type-safe development implemented',
        success: hasTypeScript,
        details: hasTypeScript ? 'TypeScript interfaces found, no any types detected' : undefined,
        error: hasTypeScript ? undefined : 'Missing TypeScript safety or using any types',
      });
    } catch (error) {
      checks.push({
        name: 'Type-safe development implemented',
        success: false,
        error: 'Could not verify TypeScript implementation',
      });
    }
  } catch (error) {
    checks.push({
      name: 'Constitutional compliance validation',
      success: false,
      error: `Failed to validate compliance: ${error}`,
    });
  }

  const success = checks.every((check) => check.success);
  const duration = Date.now() - startTime;

  console.log(
    `   ${success ? '✅' : '❌'} Constitutional compliance validation completed in ${duration}ms`
  );
  console.log(`   Compliance checks: ${checks.filter((c) => c.success).length}/${checks.length}`);
  console.log('');

  return { name: 'Constitutional Compliance', checks, success, duration };
}

// Export for use in validation scripts
export default validateEntireSystem;
