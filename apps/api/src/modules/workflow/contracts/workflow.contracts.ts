import type { ExecutionIntent } from '../../output/models/execution-intent.models';
import type { CreateWorkflowDto } from '../dto/workflow.dto';
import type {
  ExecutableWorkflow,
  ExecutionStrategy,
  WorkflowContext,
  WorkflowDraft,
  WorkflowGraph,
} from '../models/workflow.models';

export const WORKFLOW_SERVICE = Symbol('WORKFLOW_SERVICE');
export const WORKFLOW_CONTROLLER = Symbol('WORKFLOW_CONTROLLER');
export const WORKFLOW_BUILDER = Symbol('WORKFLOW_BUILDER');
export const DEPENDENCY_GRAPH_BUILDER = Symbol('DEPENDENCY_GRAPH_BUILDER');
export const WORKFLOW_VALIDATOR = Symbol('WORKFLOW_VALIDATOR');
export const EXECUTION_STRATEGY_BUILDER = Symbol('EXECUTION_STRATEGY_BUILDER');
export const WORKFLOW_CONTEXT_MANAGER = Symbol('WORKFLOW_CONTEXT_MANAGER');
export const EXECUTABLE_WORKFLOW_BUILDER = Symbol('EXECUTABLE_WORKFLOW_BUILDER');

export interface IWorkflowBuilder {
  build(intent: ExecutionIntent): WorkflowDraft;
}

export interface IDependencyGraphBuilder {
  build(draft: WorkflowDraft, intent: ExecutionIntent): WorkflowGraph;
}

export interface IWorkflowValidator {
  validate(draft: WorkflowDraft, graph: WorkflowGraph): void;
}

export interface IExecutionStrategyBuilder {
  build(draft: WorkflowDraft, graph: WorkflowGraph): ExecutionStrategy;
}

export interface IWorkflowContextManager {
  build(intent: ExecutionIntent): WorkflowContext;
}

export interface IExecutableWorkflowBuilder {
  build(
    draft: WorkflowDraft,
    graph: WorkflowGraph,
    strategy: ExecutionStrategy,
    context: WorkflowContext,
  ): ExecutableWorkflow;
}

export interface IWorkflowController {
  createWorkflow(dto: CreateWorkflowDto | ExecutionIntent): Promise<ExecutableWorkflow>;
}

/** Sole public Workflow Engine contract. */
export interface IWorkflowService {
  createWorkflow(executionIntent: ExecutionIntent): Promise<ExecutableWorkflow>;
}
