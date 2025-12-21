import type { ReactiveEffect } from './effect';

/**
 * @description IEffect 类型别名
 * @internal
 */
export type IEffect = () => void;

let isBatching = false;
const queue = new Set<IEffect>();
let isFlushPending = false;

function flushJobs() {
  isFlushPending = false;
  const jobsToRun = [...queue];
  queue.clear();

  for (const job of jobsToRun) {
    job();
  }
}

export function scheduleFlush() {
  if (!isFlushPending && !isBatching) {
    isFlushPending = true;
    Promise.resolve().then(flushJobs);
  }
}

export function queueEffect(effect: IEffect) {
  if (!queue.has(effect)) {
    queue.add(effect);
    scheduleFlush();
  }
}

/**
 * @description 将多个状态更新合并到一个批次中, 在下一个微任务中统一触发 effect 更新
 * @param fn 要执行的包含多个状态变更的函数
 */
export function batch(fn: () => void) {
  const wasBatching = isBatching;
  isBatching = true;
  try {
    fn();
  } finally {
    if (!wasBatching) {
      isBatching = false;
      flushJobs();
    }
  }
}
