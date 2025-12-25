import { describe, it, expect, vi } from 'vitest';
import {
  createComponentInstance,
  onMount,
  onUpdate,
  onUnmount,
  type Component,
} from '../src/component';

describe('Component Instance', () => {
  it('should create a component instance with correct properties', () => {
    const component: Component = {
      setup: () => ({}),
    };
    const props = { id: 'test' };
    const instance = createComponentInstance(component, props);

    expect(instance).toBeDefined();
    expect(instance.uid).toBeTypeOf('number');
    expect(instance.component).toBe(component);
    expect(instance.props).toBe(props);
    expect(instance.state).toEqual({});
    expect(instance.isMounted).toBe(false);
    expect(instance.onMount).toEqual([]);
    expect(instance.onUpdate).toEqual([]);
    expect(instance.onUnmount).toEqual([]);
  });

  it('should call the setup function and assign its return to state', () => {
    const setupState = { count: 1 };
    const component: Component = {
      setup: () => setupState,
    };
    const instance = createComponentInstance(component, {});

    expect(instance.state).toBe(setupState);
  });

  it('should register lifecycle hooks during setup', () => {
    const mountHook = vi.fn();
    const updateHook = vi.fn();
    const unmountHook = vi.fn();

    const component: Component = {
      setup: () => {
        onMount(mountHook);
        onUpdate(updateHook);
        onUnmount(unmountHook);
        return {};
      },
    };

    const instance = createComponentInstance(component, {});

    expect(instance.onMount).toContain(mountHook);
    expect(instance.onUpdate).toContain(updateHook);
    expect(instance.onUnmount).toContain(unmountHook);
    expect(instance.onMount.length).toBe(1);
    expect(instance.onUpdate.length).toBe(1);
    expect(instance.onUnmount.length).toBe(1);
  });

  it('should warn when lifecycle hooks are called outside of setup', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    onMount(() => {});
    expect(warnSpy).toHaveBeenCalledWith('onMount must be called within a component setup function.');

    onUpdate(() => {});
    expect(warnSpy).toHaveBeenCalledWith('onUpdate must be called within a component setup function.');

    onUnmount(() => {});
    expect(warnSpy).toHaveBeenCalledWith('onUnmount must be called within a component setup function.');

    warnSpy.mockRestore();
  });
});

