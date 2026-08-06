import { Inject, Injectable } from '@nestjs/common';
import type { ExecutionIntent } from '../../output/models/execution-intent.models';
import {
  DEPENDENCY_GRAPH_BUILDER,
  EXECUTABLE_WORKFLOW_BUILDER,
  EXECUTION_STRATEGY_BUILDER,
  WORKFLOW_BUILDER,
  WORKFLOW_CONTEXT_MANAGER,
  WORKFLOW_VALIDATOR,
  type IDependencyGraphBuilder,
  type IExecutableWorkflowBuilder,
  type IExecutionStrategyBuilder,
  type IWorkflowBuilder,
  type IWorkflowContextManager,
  type IWorkflowController,
  type IWorkflowValidator,
} from '../contracts';
import type { CreateWorkflowDto } from '../dto/workflow.dto';
import type { ExecutableWorkflow } from '../models/workflow.models';

/**
 * Workflow Controller — orchestrate compile pipeline only.
 * Never executes tasks or manages runtime state.
 */
@Injectable()
export class WorkflowController implements IWorkflowController {
  constructor(
    @Inject(WORKFLOW_BUILDER) private readonly builder: IWorkflowBuilder,
    @Inject(DEPENDENCY_GRAPH_BUILDER)
    private readonly graphBuilder: IDependencyGraphBuilder,
    @Inject(WORKFLOW_VALIDATOR) private readonly validator: IWorkflowValidator,
    @Inject(EXECUTION_STRATEGY_BUILDER)
    private readonly strategyBuilder: IExecutionStrategyBuilder,
    @Inject(WORKFLOW_CONTEXT_MANAGER)
    private readonly contextManager: IWorkflowContextManager,
    @Inject(EXECUTABLE_WORKFLOW_BUILDER)
    private readonly executableBuilder: IExecutableWorkflowBuilder,
  ) {}

  async createWorkflow(
    dto: CreateWorkflowDto | ExecutionIntent,
  ): Promise<ExecutableWorkflow> {
    const intent = this.unwrap(dto);
    const draft = this.builder.build(intent);
    const graph = this.graphBuilder.build(draft, intent);
    this.validator.validate(draft, graph);
    const strategy = this.strategyBuilder.build(draft, graph);
    const context = this.contextManager.build(intent);
    return this.executableBuilder.build(draft, graph, strategy, context);
  }

  private unwrap(dto: CreateWorkflowDto | ExecutionIntent): ExecutionIntent {
    if (!dto || typeof dto !== 'object') {
      throw new Error('ExecutionIntent is required');
    }
    if ('executionIntent' in dto) {
      if (!dto.executionIntent) {
        throw new Error('ExecutionIntent is required');
      }
      return dto.executionIntent;
    }
    return dto;
  }
}
