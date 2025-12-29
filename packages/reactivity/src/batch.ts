import type { ReactiveEffect } from './effect';
import { globalState } from './store';

// A promise that resolves when the job queue is empty.
let jobDonePromise: Promise<void> | null = null;
let resolveJobDone: (() => void) | null = null;



/**
 * @description 将一个 effect 加入队列，并安排一个微任务来刷新队列。
 * @param effect - 要加入队列的 ReactiveEffect 实例。
 * @example
 * // 在 effect.ts 内部，当依赖变化时，此函数被作为调度器调用
 * // effect.scheduler(effect);
 * @performance 队列操作和微任务调度非常快，主要开销在 effect 的实际执行。
 * @note 此函数通过 Set 自动处理 effect 去重。
 * @since v0.1.0
 */
export function queueJob(effect: ReactiveEffect): void {

  // 将 effect 添加到队列中，Set 会自动处理重复
  if (!globalState.queue.has(effect)) {
    globalState.queue.add(effect);
    // 安排刷新队列
    scheduleFlush();
  }
}

export function queueJob2(effect: ReactiveEffect,queue: Set<ReactiveEffect>): void {
  // 将 effect 添加到队列中，Set 会自动处理重复
  if (!queue.has(effect)) {
    queue.add(effect);
    // 安排刷新队列
    scheduleFlush();
  }
}

export function queueJob3(effect: ReactiveEffect): void {
  // 将 effect 添加到队列中，Set 会自动处理重复
  if (!globalState.queue.has(effect)) {
    globalState.queue.add(effect);
    // 安排刷新队列
    scheduleFlush();
  }
}

/**
 * @description 安排一个微任务来执行队列刷新。
 * @internal
 */
function scheduleFlush(): void {
  if (!jobDonePromise) {
    jobDonePromise = new Promise(resolve => {
      resolveJobDone = resolve;
    });
  }

  // 如果当前没有正在刷新，也没有在批处理中，则立即刷新队列
  if (!globalState.isFlushing && !globalState.isBatching) {
    flushJobs();
  }
}

/**
 * @description 刷新并执行队列中的所有 effect。
 * @internal
 */
function flushJobs(): void {
  globalState.isFlushPending = false;
  globalState.isFlushing = true;

  try {
    for (const effect of globalState.queue) {
      effect.run();
    }
  } finally {
    globalState.queue.clear();
    globalState.isFlushing = false;

    // If there's a promise waiting, resolve it now that the queue is empty.
    if (resolveJobDone) {
      resolveJobDone();
      jobDonePromise = null;
      resolveJobDone = null;
    }
  }
}

/**
 * @description 将多个状态变更组合成一个“批处理”，在所有变更完成后只触发一次 effect 更新。
 * @param fn - 包含多个状态变更的函数。
 * @example
 * const [firstName, setFirstName] = createSignal('John');
 * const [lastName, setLastName] = createSignal('Doe');
 *
 * createEffect(() => {
 *   console.log(`Name: ${firstName()} ${lastName()}`);
 * });
 *
 * batch(() => {
 *   setFirstName('Jane'); // 此处不会触发 effect
 *   setLastName('Smith'); // 此处不会触发 effect
 * });
 * // 在 batch 函数执行完毕后，effect 才会运行一次，打印 "Name: Jane Smith"
 * @performance 显著提升性能，通过合并多次更新为一次，避免不必要的重复渲染。
 * @note 支持嵌套调用，只有最外层的 batch 调用会触发最终的更新。
 * @since v0.1.0
 */
export function batch(fn: () => void): void {
  // 如果已经在批量模式中，则直接执行函数，由外层 batch 控制刷新
  if (globalState.isBatching) {
    fn();
    return;
  }

  // 进入批量模式
  globalState.isBatching = true;
  try {
    // 执行包含状态变更的函数
    fn();
  } finally {
    // 退出批量模式
    globalState.isBatching = false;
    // 在最外层 batch 结束后，如果队列中有待处理的 effect，则立即刷新
    if (globalState.queue.size > 0) {
      flushJobs();
    }
  }
}
