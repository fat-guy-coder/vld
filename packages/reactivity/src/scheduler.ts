// ==================== 类型定义 ====================

/**
 * @description 任务优先级
 * @enum {number}
 */
export const enum SchedulerPriority {
  /** 立即执行，同步。最高优先级。 */
  Immediate = 0,
  /** 用户阻塞级别，例如处理输入事件，必须在当前帧完成。 */
  UserBlocking = 1,
  /** 普通级别，例如数据获取后的更新，可以推迟到下一帧。 */
  Normal = 2,
  /** 低优先级，例如不重要的后台任务。 */
  Low = 3,
  /** 空闲时执行，只有在浏览器空闲时才执行。 */
  Idle = 4,
}

type SchedulerJob = () => void;

interface Task {
  id: number;
  job: SchedulerJob;
  priority: SchedulerPriority;
}

// ==================== 核心实现 ====================

const taskQueue: Task[] = [];
let isHostCallbackScheduled = false;
let isPerformingWork = false;
let taskIdCounter = 0;

// 浏览器 API 兼容性处理
const scheduleHostCallback = typeof requestIdleCallback === 'function'
  ? requestIdleCallback
  : (callback: (deadline: IdleDeadline) => void) => setTimeout(() => callback({ 
      didTimeout: false, 
      timeRemaining: () => Infinity 
    }), 0);

const cancelHostCallback = typeof cancelIdleCallback === 'function'
  ? cancelIdleCallback
  : clearTimeout;

function workLoop(deadline?: IdleDeadline) {
  isHostCallbackScheduled = false;
  isPerformingWork = true;
  try {
    // 如果有 deadline 对象并且时间切片需要继续，则循环执行
    while (taskQueue.length > 0 && (deadline ? deadline.timeRemaining() > 1 : true)) {
      const task = taskQueue.sort((a, b) => a.priority - b.priority).shift();
      if (task) {
        try {
          task.job();
        } catch (error) {
          console.error(`[vld/scheduler] Error in scheduled job (task id: ${task.id}):`, error);
        }
      }
    }
  } finally {
    isPerformingWork = false;
    // 如果队列中还有任务，则安排下一次调度
    if (taskQueue.length > 0) {
      scheduleFlush();
    }
  }
}

function scheduleFlush() {
  if (!isHostCallbackScheduled && !isPerformingWork) {
    isHostCallbackScheduled = true;
    scheduleHostCallback(workLoop as any);
  }
}

// ==================== API ====================

/**
 * 安排一个任务在未来的某个时间点执行
 * @description 将一个任务添加到调度队列中。高优先级的任务会比低优先级的任务先执行。
 * @param {SchedulerJob} job - 要执行的任务函数
 * @param {SchedulerPriority} [priority=SchedulerPriority.Normal] - 任务的优先级
 * @returns {number} 任务的唯一ID，可用于取消任务
 * @example
 * // 安排一个普通任务
 * const taskId = scheduleJob(() => {
 *   console.log('Normal priority job executed.');
 * });
 *
 * // 安排一个高优先级任务
 * scheduleJob(() => {
 *   console.log('User-blocking job executed.');
 * }, SchedulerPriority.UserBlocking);
 *
 * // 取消任务
 * cancelJob(taskId);
 *
 * @performance
 * 时间复杂度: 入队 O(1), 出队 O(log N) (由于排序)
 * 空间复杂度: O(N) (N为任务数)
 * 优化: 利用 `requestIdleCallback` 进行时间切片，避免阻塞主线程。
 * @note
 * - 这是一个简化的调度器，真实的实现会更复杂，例如包含任务过期逻辑。
 * - `Immediate` 优先级会使任务同步执行，请谨慎使用。
 * @since v0.1.0
 */
export function scheduleJob(job: SchedulerJob, priority: SchedulerPriority = SchedulerPriority.Normal): number {
  if (priority === SchedulerPriority.Immediate) {
    job();
    return -1;
  }

  const taskId = taskIdCounter++;
  const task: Task = {
    id: taskId,
    job,
    priority,
  };

  taskQueue.push(task);
  scheduleFlush();
  return taskId;
}

/**
 * 取消一个已安排的任务
 * @description 从调度队列中移除一个尚未执行的任务。
 * @param {number} taskId - `scheduleJob` 返回的任务ID
 * @returns {boolean} 如果任务被成功找到并移除，返回 true。
 * @example
 * const taskId = scheduleJob(() => console.log('This will not run.'));
 * const success = cancelJob(taskId);
 * console.log('Job cancelled:', success); // true
 * @since v0.1.0
 */
export function cancelJob(taskId: number): boolean {
  const taskIndex = taskQueue.findIndex(t => t.id === taskId);
  if (taskIndex > -1) {
    taskQueue.splice(taskIndex, 1);
    return true;
  }
  return false;
}

