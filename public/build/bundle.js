
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    // Adapted from https://github.com/then/is-promise/blob/master/index.js
    // Distributed under MIT License https://github.com/then/is-promise/blob/master/LICENSE
    function is_promise(value) {
        return !!value && (typeof value === 'object' || typeof value === 'function') && typeof value.then === 'function';
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot_base(slot, slot_definition, ctx, $$scope, slot_changes, get_slot_context_fn) {
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function get_all_dirty_from_scope($$scope) {
        if ($$scope.ctx.length > 32) {
            const dirty = [];
            const length = $$scope.ctx.length / 32;
            for (let i = 0; i < length; i++) {
                dirty[i] = -1;
            }
            return dirty;
        }
        return -1;
    }
    function exclude_internal_props(props) {
        const result = {};
        for (const k in props)
            if (k[0] !== '$')
                result[k] = props[k];
        return result;
    }
    function compute_rest_props(props, keys) {
        const rest = {};
        keys = new Set(keys);
        for (const k in props)
            if (!keys.has(k) && k[0] !== '$')
                rest[k] = props[k];
        return rest;
    }
    function compute_slots(slots) {
        const result = {};
        for (const key in slots) {
            result[key] = true;
        }
        return result;
    }
    function set_store_value(store, ret, value) {
        store.set(value);
        return ret;
    }
    function action_destroyer(action_result) {
        return action_result && is_function(action_result.destroy) ? action_result.destroy : noop;
    }
    function split_css_unit(value) {
        const split = typeof value === 'string' && value.match(/^\s*(-?[\d.]+)([^\s]*)\s*$/);
        return split ? [parseFloat(split[1]), split[2] || 'px'] : [value, 'px'];
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    // Needs to be written like this to pass the tree-shake-test
    'WeakMap' in globals ? new WeakMap() : undefined;
    function append(target, node) {
        target.appendChild(node);
    }
    function get_root_for_style(node) {
        if (!node)
            return document;
        const root = node.getRootNode ? node.getRootNode() : node.ownerDocument;
        if (root && root.host) {
            return root;
        }
        return node.ownerDocument;
    }
    function append_empty_stylesheet(node) {
        const style_element = element('style');
        append_stylesheet(get_root_for_style(node), style_element);
        return style_element.sheet;
    }
    function append_stylesheet(node, style) {
        append(node.head || node, style);
        return style.sheet;
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        if (node.parentNode) {
            node.parentNode.removeChild(node);
        }
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function stop_propagation(fn) {
        return function (event) {
            event.stopPropagation();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    /**
     * List of attributes that should always be set through the attr method,
     * because updating them through the property setter doesn't work reliably.
     * In the example of `width`/`height`, the problem is that the setter only
     * accepts numeric values, but the attribute can also be set to a string like `50%`.
     * If this list becomes too big, rethink this approach.
     */
    const always_set_through_set_attribute = ['width', 'height'];
    function set_attributes(node, attributes) {
        // @ts-ignore
        const descriptors = Object.getOwnPropertyDescriptors(node.__proto__);
        for (const key in attributes) {
            if (attributes[key] == null) {
                node.removeAttribute(key);
            }
            else if (key === 'style') {
                node.style.cssText = attributes[key];
            }
            else if (key === '__value') {
                node.value = node[key] = attributes[key];
            }
            else if (descriptors[key] && descriptors[key].set && always_set_through_set_attribute.indexOf(key) === -1) {
                node[key] = attributes[key];
            }
            else {
                attr(node, key, attributes[key]);
            }
        }
    }
    function set_custom_element_data_map(node, data_map) {
        Object.keys(data_map).forEach((key) => {
            set_custom_element_data(node, key, data_map[key]);
        });
    }
    function set_custom_element_data(node, prop, value) {
        if (prop in node) {
            node[prop] = typeof node[prop] === 'boolean' && value === '' ? true : value;
        }
        else {
            attr(node, prop, value);
        }
    }
    function set_dynamic_element_data(tag) {
        return (/-/.test(tag)) ? set_custom_element_data_map : set_attributes;
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, cancelable, detail);
        return e;
    }
    class HtmlTag {
        constructor(is_svg = false) {
            this.is_svg = false;
            this.is_svg = is_svg;
            this.e = this.n = null;
        }
        c(html) {
            this.h(html);
        }
        m(html, target, anchor = null) {
            if (!this.e) {
                if (this.is_svg)
                    this.e = svg_element(target.nodeName);
                /** #7364  target for <template> may be provided as #document-fragment(11) */
                else
                    this.e = element((target.nodeType === 11 ? 'TEMPLATE' : target.nodeName));
                this.t = target.tagName !== 'TEMPLATE' ? target : target.content;
                this.c(html);
            }
            this.i(anchor);
        }
        h(html) {
            this.e.innerHTML = html;
            this.n = Array.from(this.e.nodeName === 'TEMPLATE' ? this.e.content.childNodes : this.e.childNodes);
        }
        i(anchor) {
            for (let i = 0; i < this.n.length; i += 1) {
                insert(this.t, this.n[i], anchor);
            }
        }
        p(html) {
            this.d();
            this.h(html);
            this.i(this.a);
        }
        d() {
            this.n.forEach(detach);
        }
    }

    // we need to store the information for multiple documents because a Svelte application could also contain iframes
    // https://github.com/sveltejs/svelte/issues/3624
    const managed_styles = new Map();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_style_information(doc, node) {
        const info = { stylesheet: append_empty_stylesheet(node), rules: {} };
        managed_styles.set(doc, info);
        return info;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = get_root_for_style(node);
        const { stylesheet, rules } = managed_styles.get(doc) || create_style_information(doc, node);
        if (!rules[name]) {
            rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ''}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            managed_styles.forEach(info => {
                const { ownerNode } = info.stylesheet;
                // there is no ownerNode if it runs on jsdom.
                if (ownerNode)
                    detach(ownerNode);
            });
            managed_styles.clear();
        });
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    /**
     * Schedules a callback to run immediately before the component is updated after any state change.
     *
     * The first time the callback runs will be before the initial `onMount`
     *
     * https://svelte.dev/docs#run-time-svelte-beforeupdate
     */
    function beforeUpdate(fn) {
        get_current_component().$$.before_update.push(fn);
    }
    /**
     * The `onMount` function schedules a callback to run as soon as the component has been mounted to the DOM.
     * It must be called during the component's initialisation (but doesn't need to live *inside* the component;
     * it can be called from an external module).
     *
     * `onMount` does not run inside a [server-side component](/docs#run-time-server-side-component-api).
     *
     * https://svelte.dev/docs#run-time-svelte-onmount
     */
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    /**
     * Schedules a callback to run immediately after the component has been updated.
     *
     * The first time the callback runs will be after the initial `onMount`
     */
    function afterUpdate(fn) {
        get_current_component().$$.after_update.push(fn);
    }
    /**
     * Schedules a callback to run immediately before the component is unmounted.
     *
     * Out of `onMount`, `beforeUpdate`, `afterUpdate` and `onDestroy`, this is the
     * only one that runs inside a server-side component.
     *
     * https://svelte.dev/docs#run-time-svelte-ondestroy
     */
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    /**
     * Retrieves the context that belongs to the closest parent component with the specified `key`.
     * Must be called during component initialisation.
     *
     * https://svelte.dev/docs#run-time-svelte-getcontext
     */
    function getContext(key) {
        return get_current_component().$$.context.get(key);
    }
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            // @ts-ignore
            callbacks.slice().forEach(fn => fn.call(this, event));
        }
    }

    const dirty_components = [];
    const binding_callbacks = [];
    let render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = /* @__PURE__ */ Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        // Do not reenter flush while dirty components are updated, as this can
        // result in an infinite loop. Instead, let the inner flush handle it.
        // Reentrancy is ok afterwards for bindings etc.
        if (flushidx !== 0) {
            return;
        }
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            try {
                while (flushidx < dirty_components.length) {
                    const component = dirty_components[flushidx];
                    flushidx++;
                    set_current_component(component);
                    update(component.$$);
                }
            }
            catch (e) {
                // reset dirty state to not end up in a deadlocked state and then rethrow
                dirty_components.length = 0;
                flushidx = 0;
                throw e;
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    /**
     * Useful for example to execute remaining `afterUpdate` callbacks before executing `destroy`.
     */
    function flush_render_callbacks(fns) {
        const filtered = [];
        const targets = [];
        render_callbacks.forEach((c) => fns.indexOf(c) === -1 ? filtered.push(c) : targets.push(c));
        targets.forEach((c) => c());
        render_callbacks = filtered;
    }

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
        else if (callback) {
            callback();
        }
    }
    const null_transition = { duration: 0 };
    function create_in_transition(node, fn, params) {
        const options = { direction: 'in' };
        let config = fn(node, params, options);
        let running = false;
        let animation_name;
        let task;
        let uid = 0;
        function cleanup() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 0, 1, duration, delay, easing, css, uid++);
            tick(0, 1);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            if (task)
                task.abort();
            running = true;
            add_render_callback(() => dispatch(node, true, 'start'));
            task = loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(1, 0);
                        dispatch(node, true, 'end');
                        cleanup();
                        return running = false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(t, 1 - t);
                    }
                }
                return running;
            });
        }
        let started = false;
        return {
            start() {
                if (started)
                    return;
                started = true;
                delete_rule(node);
                if (is_function(config)) {
                    config = config(options);
                    wait().then(go);
                }
                else {
                    go();
                }
            },
            invalidate() {
                started = false;
            },
            end() {
                if (running) {
                    cleanup();
                    running = false;
                }
            }
        };
    }
    function create_out_transition(node, fn, params) {
        const options = { direction: 'out' };
        let config = fn(node, params, options);
        let running = true;
        let animation_name;
        const group = outros;
        group.r += 1;
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 1, 0, duration, delay, easing, css);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            add_render_callback(() => dispatch(node, false, 'start'));
            loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(0, 1);
                        dispatch(node, false, 'end');
                        if (!--group.r) {
                            // this will result in `end()` being called,
                            // so we don't need to clean up here
                            run_all(group.c);
                        }
                        return false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(1 - t, t);
                    }
                }
                return running;
            });
        }
        if (is_function(config)) {
            wait().then(() => {
                // @ts-ignore
                config = config(options);
                go();
            });
        }
        else {
            go();
        }
        return {
            end(reset) {
                if (reset && config.tick) {
                    config.tick(1, 0);
                }
                if (running) {
                    if (animation_name)
                        delete_rule(node, animation_name);
                    running = false;
                }
            }
        };
    }

    function handle_promise(promise, info) {
        const token = info.token = {};
        function update(type, index, key, value) {
            if (info.token !== token)
                return;
            info.resolved = value;
            let child_ctx = info.ctx;
            if (key !== undefined) {
                child_ctx = child_ctx.slice();
                child_ctx[key] = value;
            }
            const block = type && (info.current = type)(child_ctx);
            let needs_flush = false;
            if (info.block) {
                if (info.blocks) {
                    info.blocks.forEach((block, i) => {
                        if (i !== index && block) {
                            group_outros();
                            transition_out(block, 1, 1, () => {
                                if (info.blocks[i] === block) {
                                    info.blocks[i] = null;
                                }
                            });
                            check_outros();
                        }
                    });
                }
                else {
                    info.block.d(1);
                }
                block.c();
                transition_in(block, 1);
                block.m(info.mount(), info.anchor);
                needs_flush = true;
            }
            info.block = block;
            if (info.blocks)
                info.blocks[index] = block;
            if (needs_flush) {
                flush();
            }
        }
        if (is_promise(promise)) {
            const current_component = get_current_component();
            promise.then(value => {
                set_current_component(current_component);
                update(info.then, 1, info.value, value);
                set_current_component(null);
            }, error => {
                set_current_component(current_component);
                update(info.catch, 2, info.error, error);
                set_current_component(null);
                if (!info.hasCatch) {
                    throw error;
                }
            });
            // if we previously had a then/catch block, destroy it
            if (info.current !== info.pending) {
                update(info.pending, 0);
                return true;
            }
        }
        else {
            if (info.current !== info.then) {
                update(info.then, 1, info.value, promise);
                return true;
            }
            info.resolved = promise;
        }
    }
    function update_await_block_branch(info, ctx, dirty) {
        const child_ctx = ctx.slice();
        const { resolved } = info;
        if (info.current === info.then) {
            child_ctx[info.value] = resolved;
        }
        if (info.current === info.catch) {
            child_ctx[info.error] = resolved;
        }
        info.block.p(child_ctx, dirty);
    }
    function outro_and_destroy_block(block, lookup) {
        transition_out(block, 1, 1, () => {
            lookup.delete(block.key);
        });
    }
    function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
        let o = old_blocks.length;
        let n = list.length;
        let i = o;
        const old_indexes = {};
        while (i--)
            old_indexes[old_blocks[i].key] = i;
        const new_blocks = [];
        const new_lookup = new Map();
        const deltas = new Map();
        const updates = [];
        i = n;
        while (i--) {
            const child_ctx = get_context(ctx, list, i);
            const key = get_key(child_ctx);
            let block = lookup.get(key);
            if (!block) {
                block = create_each_block(key, child_ctx);
                block.c();
            }
            else if (dynamic) {
                // defer updates until all the DOM shuffling is done
                updates.push(() => block.p(child_ctx, dirty));
            }
            new_lookup.set(key, new_blocks[i] = block);
            if (key in old_indexes)
                deltas.set(key, Math.abs(i - old_indexes[key]));
        }
        const will_move = new Set();
        const did_move = new Set();
        function insert(block) {
            transition_in(block, 1);
            block.m(node, next);
            lookup.set(block.key, block);
            next = block.first;
            n--;
        }
        while (o && n) {
            const new_block = new_blocks[n - 1];
            const old_block = old_blocks[o - 1];
            const new_key = new_block.key;
            const old_key = old_block.key;
            if (new_block === old_block) {
                // do nothing
                next = new_block.first;
                o--;
                n--;
            }
            else if (!new_lookup.has(old_key)) {
                // remove old block
                destroy(old_block, lookup);
                o--;
            }
            else if (!lookup.has(new_key) || will_move.has(new_key)) {
                insert(new_block);
            }
            else if (did_move.has(old_key)) {
                o--;
            }
            else if (deltas.get(new_key) > deltas.get(old_key)) {
                did_move.add(new_key);
                insert(new_block);
            }
            else {
                will_move.add(old_key);
                o--;
            }
        }
        while (o--) {
            const old_block = old_blocks[o];
            if (!new_lookup.has(old_block.key))
                destroy(old_block, lookup);
        }
        while (n)
            insert(new_blocks[n - 1]);
        run_all(updates);
        return new_blocks;
    }
    function validate_each_keys(ctx, list, get_context, get_key) {
        const keys = new Set();
        for (let i = 0; i < list.length; i++) {
            const key = get_key(get_context(ctx, list, i));
            if (keys.has(key)) {
                throw new Error('Cannot have duplicate keys in a keyed each');
            }
            keys.add(key);
        }
    }

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }

    const _boolean_attributes = [
        'allowfullscreen',
        'allowpaymentrequest',
        'async',
        'autofocus',
        'autoplay',
        'checked',
        'controls',
        'default',
        'defer',
        'disabled',
        'formnovalidate',
        'hidden',
        'inert',
        'ismap',
        'loop',
        'multiple',
        'muted',
        'nomodule',
        'novalidate',
        'open',
        'playsinline',
        'readonly',
        'required',
        'reversed',
        'selected'
    ];
    /**
     * List of HTML boolean attributes (e.g. `<input disabled>`).
     * Source: https://html.spec.whatwg.org/multipage/indices.html
     */
    new Set([..._boolean_attributes]);

    /** regex of all html void element names */
    const void_element_names = /^(?:area|base|br|col|command|embed|hr|img|input|keygen|link|meta|param|source|track|wbr)$/;
    function is_void(name) {
        return void_element_names.test(name) || name.toLowerCase() === '!doctype';
    }

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = component.$$.on_mount.map(run).filter(is_function);
                // if the component was destroyed immediately
                // it will update the `$$.on_destroy` reference to `null`.
                // the destructured on_destroy may still reference to the old array
                if (component.$$.on_destroy) {
                    component.$$.on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            flush_render_callbacks($$.after_update);
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: [],
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            if (!is_function(callback)) {
                return noop;
            }
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.59.1' }, detail), { bubbles: true }));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation, has_stop_immediate_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        if (has_stop_immediate_propagation)
            modifiers.push('stopImmediatePropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.data === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    function validate_dynamic_element(tag) {
        const is_string = typeof tag === 'string';
        if (tag && !is_string) {
            throw new Error('<svelte:element> expects "this" attribute to be a string.');
        }
    }
    function validate_void_dynamic_element(tag) {
        if (tag && is_void(tag)) {
            console.warn(`<svelte:element this="${tag}"> is self-closing and cannot have content.`);
        }
    }
    function construct_svelte_component_dev(component, props) {
        const error_message = 'this={...} of <svelte:component> should specify a Svelte component.';
        try {
            const instance = new component(props);
            if (!instance.$$ || !instance.$set || !instance.$on || !instance.$destroy) {
                throw new Error(error_message);
            }
            return instance;
        }
        catch (err) {
            const { message } = err;
            if (typeof message === 'string' && message.indexOf('is not a constructor') !== -1) {
                throw new Error(error_message);
            }
            else {
                throw err;
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    function cubicInOut(t) {
        return t < 0.5 ? 4.0 * t * t * t : 0.5 * Math.pow(2.0 * t - 2.0, 3.0) + 1.0;
    }
    function cubicOut(t) {
        const f = t - 1.0;
        return f * f * f + 1.0;
    }

    function blur(node, { delay = 0, duration = 400, easing = cubicInOut, amount = 5, opacity = 0 } = {}) {
        const style = getComputedStyle(node);
        const target_opacity = +style.opacity;
        const f = style.filter === 'none' ? '' : style.filter;
        const od = target_opacity * (1 - opacity);
        const [value, unit] = split_css_unit(amount);
        return {
            delay,
            duration,
            easing,
            css: (_t, u) => `opacity: ${target_opacity - (od * u)}; filter: ${f} blur(${u * value}${unit});`
        };
    }
    function fade(node, { delay = 0, duration = 400, easing = identity } = {}) {
        const o = +getComputedStyle(node).opacity;
        return {
            delay,
            duration,
            easing,
            css: t => `opacity: ${t * o}`
        };
    }
    function fly(node, { delay = 0, duration = 400, easing = cubicOut, x = 0, y = 0, opacity = 0 } = {}) {
        const style = getComputedStyle(node);
        const target_opacity = +style.opacity;
        const transform = style.transform === 'none' ? '' : style.transform;
        const od = target_opacity * (1 - opacity);
        const [xValue, xUnit] = split_css_unit(x);
        const [yValue, yUnit] = split_css_unit(y);
        return {
            delay,
            duration,
            easing,
            css: (t, u) => `
			transform: ${transform} translate(${(1 - t) * xValue}${xUnit}, ${(1 - t) * yValue}${yUnit});
			opacity: ${target_opacity - (od * u)}`
        };
    }
    function slide(node, { delay = 0, duration = 400, easing = cubicOut, axis = 'y' } = {}) {
        const style = getComputedStyle(node);
        const opacity = +style.opacity;
        const primary_property = axis === 'y' ? 'height' : 'width';
        const primary_property_value = parseFloat(style[primary_property]);
        const secondary_properties = axis === 'y' ? ['top', 'bottom'] : ['left', 'right'];
        const capitalized_secondary_properties = secondary_properties.map((e) => `${e[0].toUpperCase()}${e.slice(1)}`);
        const padding_start_value = parseFloat(style[`padding${capitalized_secondary_properties[0]}`]);
        const padding_end_value = parseFloat(style[`padding${capitalized_secondary_properties[1]}`]);
        const margin_start_value = parseFloat(style[`margin${capitalized_secondary_properties[0]}`]);
        const margin_end_value = parseFloat(style[`margin${capitalized_secondary_properties[1]}`]);
        const border_width_start_value = parseFloat(style[`border${capitalized_secondary_properties[0]}Width`]);
        const border_width_end_value = parseFloat(style[`border${capitalized_secondary_properties[1]}Width`]);
        return {
            delay,
            duration,
            easing,
            css: t => 'overflow: hidden;' +
                `opacity: ${Math.min(t * 20, 1) * opacity};` +
                `${primary_property}: ${t * primary_property_value}px;` +
                `padding-${secondary_properties[0]}: ${t * padding_start_value}px;` +
                `padding-${secondary_properties[1]}: ${t * padding_end_value}px;` +
                `margin-${secondary_properties[0]}: ${t * margin_start_value}px;` +
                `margin-${secondary_properties[1]}: ${t * margin_end_value}px;` +
                `border-${secondary_properties[0]}-width: ${t * border_width_start_value}px;` +
                `border-${secondary_properties[1]}-width: ${t * border_width_end_value}px;`
        };
    }
    function scale(node, { delay = 0, duration = 400, easing = cubicOut, start = 0, opacity = 0 } = {}) {
        const style = getComputedStyle(node);
        const target_opacity = +style.opacity;
        const transform = style.transform === 'none' ? '' : style.transform;
        const sd = 1 - start;
        const od = target_opacity * (1 - opacity);
        return {
            delay,
            duration,
            easing,
            css: (_t, u) => `
			transform: ${transform} scale(${1 - (sd * u)});
			opacity: ${target_opacity - (od * u)}
		`
        };
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=} start
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = new Set();
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (const subscriber of subscribers) {
                        subscriber[1]();
                        subscriber_queue.push(subscriber, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.add(subscriber);
            if (subscribers.size === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                subscribers.delete(subscriber);
                if (subscribers.size === 0 && stop) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    const score = writable(0);

    /* src/Question.svelte generated by Svelte v3.59.1 */
    const file$8 = "src/Question.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[8] = list[i];
    	return child_ctx;
    }

    // (55:8) {#each allAnswers as answer}
    function create_each_block$2(ctx) {
    	let button;
    	let html_tag;
    	let raw_value = /*answer*/ ctx[8].answer + "";
    	let t;
    	let mounted;
    	let dispose;

    	function click_handler(...args) {
    		return /*click_handler*/ ctx[5](/*answer*/ ctx[8], ...args);
    	}

    	const block = {
    		c: function create() {
    			button = element("button");
    			html_tag = new HtmlTag(false);
    			t = space();
    			html_tag.a = t;
    			attr_dev(button, "id", "answer-btn");
    			attr_dev(button, "class", "answer svelte-355la3");
    			add_location(button, file$8, 56, 16, 1152);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			html_tag.m(raw_value, button);
    			append_dev(button, t);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", click_handler, false, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(55:8) {#each allAnswers as answer}",
    		ctx
    	});

    	return block;
    }

    // (63:4) {#if isAnswered }
    function create_if_block$6(ctx) {
    	let div;
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			button = element("button");
    			button.textContent = "Next Question";
    			attr_dev(button, "class", "next-question-btn svelte-355la3");
    			add_location(button, file$8, 65, 12, 1393);
    			add_location(div, file$8, 64, 8, 1375);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, button);

    			if (!mounted) {
    				dispose = listen_dev(
    					button,
    					"click",
    					function () {
    						if (is_function(/*nextQuestion*/ ctx[1])) /*nextQuestion*/ ctx[1].apply(this, arguments);
    					},
    					false,
    					false,
    					false,
    					false
    				);

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$6.name,
    		type: "if",
    		source: "(63:4) {#if isAnswered }",
    		ctx
    	});

    	return block;
    }

    function create_fragment$a(ctx) {
    	let div2;
    	let div0;
    	let h3;
    	let raw_value = /*question*/ ctx[0].question + "";
    	let t0;
    	let div1;
    	let t1;
    	let each_value = /*allAnswers*/ ctx[3];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	let if_block = /*isAnswered*/ ctx[2] && create_if_block$6(ctx);

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			h3 = element("h3");
    			t0 = space();
    			div1 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t1 = space();
    			if (if_block) if_block.c();
    			add_location(h3, file$8, 50, 8, 1014);
    			attr_dev(div0, "class", "question-div");
    			add_location(div0, file$8, 49, 4, 979);
    			attr_dev(div1, "class", "answer-div svelte-355la3");
    			add_location(div1, file$8, 53, 4, 1069);
    			attr_dev(div2, "class", "question-component");
    			add_location(div2, file$8, 47, 0, 941);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div0, h3);
    			h3.innerHTML = raw_value;
    			append_dev(div2, t0);
    			append_dev(div2, div1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(div1, null);
    				}
    			}

    			append_dev(div2, t1);
    			if (if_block) if_block.m(div2, null);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*question*/ 1 && raw_value !== (raw_value = /*question*/ ctx[0].question + "")) h3.innerHTML = raw_value;
    			if (dirty & /*checkQuestion, allAnswers*/ 24) {
    				each_value = /*allAnswers*/ ctx[3];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div1, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (/*isAnswered*/ ctx[2]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$6(ctx);
    					if_block.c();
    					if_block.m(div2, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			destroy_each(each_blocks, detaching);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function shuffle(array) {
    	array.sort(() => Math.random() - 0.5);
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Question', slots, []);
    	let { question } = $$props;
    	let { nextQuestion } = $$props;
    	let isCorrect;
    	let isAnswered = false;

    	let answers = question.incorrect_answers.map(answer => {
    		return { answer, correct: false };
    	});

    	let allAnswers = [
    		...answers,
    		{
    			answer: question.correct_answer,
    			correct: true
    		}
    	];

    	shuffle(allAnswers);

    	function checkQuestion(correct, e) {
    		if (!isAnswered) {
    			isCorrect = correct;
    			$$invalidate(2, isAnswered = true);

    			if (correct) {
    				score.update(val => val + 1);
    				e.target.style.backgroundColor = "#80FF72";
    			} else {
    				e.target.style.backgroundColor = "#EC0B43";
    			}
    		}
    	}

    	$$self.$$.on_mount.push(function () {
    		if (question === undefined && !('question' in $$props || $$self.$$.bound[$$self.$$.props['question']])) {
    			console.warn("<Question> was created without expected prop 'question'");
    		}

    		if (nextQuestion === undefined && !('nextQuestion' in $$props || $$self.$$.bound[$$self.$$.props['nextQuestion']])) {
    			console.warn("<Question> was created without expected prop 'nextQuestion'");
    		}
    	});

    	const writable_props = ['question', 'nextQuestion'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Question> was created with unknown prop '${key}'`);
    	});

    	const click_handler = (answer, e) => checkQuestion(answer.correct, e);

    	$$self.$$set = $$props => {
    		if ('question' in $$props) $$invalidate(0, question = $$props.question);
    		if ('nextQuestion' in $$props) $$invalidate(1, nextQuestion = $$props.nextQuestion);
    	};

    	$$self.$capture_state = () => ({
    		score,
    		question,
    		nextQuestion,
    		isCorrect,
    		isAnswered,
    		answers,
    		allAnswers,
    		shuffle,
    		checkQuestion
    	});

    	$$self.$inject_state = $$props => {
    		if ('question' in $$props) $$invalidate(0, question = $$props.question);
    		if ('nextQuestion' in $$props) $$invalidate(1, nextQuestion = $$props.nextQuestion);
    		if ('isCorrect' in $$props) isCorrect = $$props.isCorrect;
    		if ('isAnswered' in $$props) $$invalidate(2, isAnswered = $$props.isAnswered);
    		if ('answers' in $$props) answers = $$props.answers;
    		if ('allAnswers' in $$props) $$invalidate(3, allAnswers = $$props.allAnswers);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [question, nextQuestion, isAnswered, allAnswers, checkQuestion, click_handler];
    }

    class Question extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, { question: 0, nextQuestion: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Question",
    			options,
    			id: create_fragment$a.name
    		});
    	}

    	get question() {
    		throw new Error("<Question>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set question(value) {
    		throw new Error("<Question>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get nextQuestion() {
    		throw new Error("<Question>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set nextQuestion(value) {
    		throw new Error("<Question>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Header.svelte generated by Svelte v3.59.1 */

    const file$7 = "src/Header.svelte";

    function create_fragment$9(ctx) {
    	let main;
    	let h1;
    	let t1;
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			main = element("main");
    			h1 = element("h1");
    			h1.textContent = "🎉 Trivia Time 🎉";
    			t1 = space();
    			button = element("button");
    			button.textContent = "Start Quiz";
    			attr_dev(h1, "class", "svelte-8p7lkn");
    			add_location(h1, file$7, 9, 4, 56);
    			attr_dev(button, "class", "restart-btn svelte-8p7lkn");
    			add_location(button, file$7, 10, 4, 87);
    			attr_dev(main, "class", "svelte-8p7lkn");
    			add_location(main, file$7, 8, 0, 45);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, h1);
    			append_dev(main, t1);
    			append_dev(main, button);

    			if (!mounted) {
    				dispose = listen_dev(
    					button,
    					"click",
    					function () {
    						if (is_function(/*resetQuiz*/ ctx[0])) /*resetQuiz*/ ctx[0].apply(this, arguments);
    					},
    					false,
    					false,
    					false,
    					false
    				);

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Header', slots, []);
    	let { resetQuiz } = $$props;

    	$$self.$$.on_mount.push(function () {
    		if (resetQuiz === undefined && !('resetQuiz' in $$props || $$self.$$.bound[$$self.$$.props['resetQuiz']])) {
    			console.warn("<Header> was created without expected prop 'resetQuiz'");
    		}
    	});

    	const writable_props = ['resetQuiz'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Header> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('resetQuiz' in $$props) $$invalidate(0, resetQuiz = $$props.resetQuiz);
    	};

    	$$self.$capture_state = () => ({ resetQuiz });

    	$$self.$inject_state = $$props => {
    		if ('resetQuiz' in $$props) $$invalidate(0, resetQuiz = $$props.resetQuiz);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [resetQuiz];
    }

    class Header extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, { resetQuiz: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Header",
    			options,
    			id: create_fragment$9.name
    		});
    	}

    	get resetQuiz() {
    		throw new Error("<Header>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set resetQuiz(value) {
    		throw new Error("<Header>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Card.svelte generated by Svelte v3.59.1 */

    const file$6 = "src/Card.svelte";

    function create_fragment$8(ctx) {
    	let div;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[1].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[0], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", "card svelte-1a8v8zf");
    			add_location(div, file$6, 1, 0, 1);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 1)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[0],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[0])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[0], dirty, null),
    						null
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Card', slots, ['default']);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Card> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('$$scope' in $$props) $$invalidate(0, $$scope = $$props.$$scope);
    	};

    	return [$$scope, slots];
    }

    class Card extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Card",
    			options,
    			id: create_fragment$8.name
    		});
    	}
    }

    /* src/CardLg.svelte generated by Svelte v3.59.1 */

    const file$5 = "src/CardLg.svelte";

    function create_fragment$7(ctx) {
    	let div;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[1].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[0], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", "card svelte-15qygg1");
    			add_location(div, file$5, 1, 0, 1);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 1)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[0],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[0])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[0], dirty, null),
    						null
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('CardLg', slots, ['default']);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<CardLg> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('$$scope' in $$props) $$invalidate(0, $$scope = $$props.$$scope);
    	};

    	return [$$scope, slots];
    }

    class CardLg extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CardLg",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    /* node_modules/@svelteuidev/core/internal/errors/Error.svelte generated by Svelte v3.59.1 */

    const { Error: Error_1$1 } = globals;

    // (7:0) {#if observable}
    function create_if_block$5(ctx) {
    	let html_tag;
    	let raw_value = exception(/*component*/ ctx[1], /*code*/ ctx[2]) + "";
    	let html_anchor;

    	const block = {
    		c: function create() {
    			html_tag = new HtmlTag(false);
    			html_anchor = empty();
    			html_tag.a = html_anchor;
    		},
    		m: function mount(target, anchor) {
    			html_tag.m(raw_value, target, anchor);
    			insert_dev(target, html_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*component, code*/ 6 && raw_value !== (raw_value = exception(/*component*/ ctx[1], /*code*/ ctx[2]) + "")) html_tag.p(raw_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(html_anchor);
    			if (detaching) html_tag.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$5.name,
    		type: "if",
    		source: "(7:0) {#if observable}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let if_block_anchor;
    	let if_block = /*observable*/ ctx[0] && create_if_block$5(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error_1$1("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*observable*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$5(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Error', slots, []);
    	let { observable = false } = $$props;
    	let { component } = $$props;
    	let { code } = $$props;

    	$$self.$$.on_mount.push(function () {
    		if (component === undefined && !('component' in $$props || $$self.$$.bound[$$self.$$.props['component']])) {
    			console.warn("<Error> was created without expected prop 'component'");
    		}

    		if (code === undefined && !('code' in $$props || $$self.$$.bound[$$self.$$.props['code']])) {
    			console.warn("<Error> was created without expected prop 'code'");
    		}
    	});

    	const writable_props = ['observable', 'component', 'code'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Error> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('observable' in $$props) $$invalidate(0, observable = $$props.observable);
    		if ('component' in $$props) $$invalidate(1, component = $$props.component);
    		if ('code' in $$props) $$invalidate(2, code = $$props.code);
    	};

    	$$self.$capture_state = () => ({ exception, observable, component, code });

    	$$self.$inject_state = $$props => {
    		if ('observable' in $$props) $$invalidate(0, observable = $$props.observable);
    		if ('component' in $$props) $$invalidate(1, component = $$props.component);
    		if ('code' in $$props) $$invalidate(2, code = $$props.code);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [observable, component, code];
    }

    let Error$1 = class Error extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, { observable: 0, component: 1, code: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Error",
    			options,
    			id: create_fragment$6.name
    		});
    	}

    	get observable() {
    		throw new Error_1$1("<Error>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set observable(value) {
    		throw new Error_1$1("<Error>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get component() {
    		throw new Error_1$1("<Error>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set component(value) {
    		throw new Error_1$1("<Error>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get code() {
    		throw new Error_1$1("<Error>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set code(value) {
    		throw new Error_1$1("<Error>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    };

    var Error$2 = Error$1;

    const isBrowser = () => typeof window !== 'undefined';
    /** Determines whether the app is running in the browser or on the server. */
    const browser = isBrowser();

    const minifiedCss = '.modal-header{padding: 2px 16px;background-color: #339af0;color: white;}.modal-body{padding: 2px 16px;}.modal-footer{padding: 2px 16px;background-color: #339af0;color: white;}.modal-content{position: relative;background-color: #fefefe;margin: auto;padding: 0;border: 1px solid #888;width: 80%;box-shadow: 0 4px 8px 0 rgba(0,0,0,0.2),0 6px 20px 0 rgba(0,0,0,0.19);animation-name: animateTop;animation-duration: 0.4s;}@keyframes animateTop {from {top: -300px; opacity: 0}to {top: 0; opacity: 1}}';

    const style = browser ? document.createElement('style') : undefined;
    if (browser) {
        const s = style;
        s.textContent = minifiedCss;
        s.id = 'svelteui-inject';
    }
    /**
     * The UserException function is used to help consumers of the library better navigate through potential errors.
     *
     *
     * It **does not** throw any errors because crashing the user's application is undesirable
     *
     * @param component the component the error is bound to
     * @param message the error message for the consumer
     * @param solution the potential solution for the consumer
     */
    function UserException(component, message, solution) {
        if (browser)
            document.head.appendChild(style);
        const html = `
    <div class="modal-content">
        <div class="modal-header">
            <h2>[${component} Component Error]:</h2>
            <h3>${message}</h3>
        </div>
        <div class="modal-body">
            <pre>
                ${solution ? solution : ''}
            </pre>
        </div>
        <div class="modal-footer">
            <h3>Fix the code to dismiss this error.</h3>
        </div>
    </div>        
    `;
        return html;
    }

    function exception(component, code) {
        const { message, solution } = code;
        if (solution) {
            return UserException(component, message, solution);
        }
        return UserException(component, message);
    }

    /* eslint-disable @typescript-eslint/no-explicit-any */
    // This file taken from rgossiaux/svelte-headlessui
    // Copyright 2020-present Hunter Perrin
    function useActions(node, actions) {
        const actionReturns = [];
        if (actions) {
            for (let i = 0; i < actions.length; i++) {
                const actionEntry = actions[i];
                const action = Array.isArray(actionEntry) ? actionEntry[0] : actionEntry;
                if (Array.isArray(actionEntry) && actionEntry.length > 1) {
                    actionReturns.push(action(node, actionEntry[1]));
                }
                else {
                    actionReturns.push(action(node));
                }
            }
        }
        return {
            update(actions) {
                if (((actions && actions.length) || 0) != actionReturns.length) {
                    throw new Error('You must not change the length of an actions array.');
                }
                if (actions) {
                    for (let i = 0; i < actions.length; i++) {
                        const returnEntry = actionReturns[i];
                        if (returnEntry && returnEntry.update) {
                            const actionEntry = actions[i];
                            if (Array.isArray(actionEntry) && actionEntry.length > 1) {
                                returnEntry.update(actionEntry[1]);
                            }
                            else {
                                returnEntry.update();
                            }
                        }
                    }
                }
            },
            destroy() {
                for (let i = 0; i < actionReturns.length; i++) {
                    const returnEntry = actionReturns[i];
                    if (returnEntry && returnEntry.destroy) {
                        returnEntry.destroy();
                    }
                }
            }
        };
    }

    /* eslint-disable @typescript-eslint/no-empty-function */
    /* eslint-disable @typescript-eslint/no-explicit-any */
    const MODIFIER_DIVIDER = '!';
    const modifierRegex = new RegExp(`^[^${MODIFIER_DIVIDER}]+(?:${MODIFIER_DIVIDER}(?:preventDefault|stopPropagation|passive|nonpassive|capture|once|self))+$`);
    /** Function for forwarding DOM events to the component's declaration */
    function createEventForwarder(component, except = []) {
        // This is our pseudo $on function. It is defined on component mount.
        let $on;
        // This is a list of events bound before mount.
        const events = [];
        // And we override the $on function to forward all bound events.
        component.$on = (fullEventType, callback) => {
            const eventType = fullEventType;
            let destructor = () => { };
            for (const exception of except) {
                if (typeof exception === 'string' && exception === eventType) {
                    // Bail out of the event forwarding and run the normal Svelte $on() code
                    const callbacks = component.$$.callbacks[eventType] || (component.$$.callbacks[eventType] = []);
                    callbacks.push(callback);
                    return () => {
                        const index = callbacks.indexOf(callback);
                        if (index !== -1)
                            callbacks.splice(index, 1);
                    };
                }
                if (typeof exception === 'object' && exception['name'] === eventType) {
                    const oldCallback = callback;
                    callback = (...props) => {
                        if (!(typeof exception === 'object' && exception['shouldExclude']())) {
                            oldCallback(...props);
                        }
                    };
                }
            }
            if ($on) {
                // The event was bound programmatically.
                destructor = $on(eventType, callback);
            }
            else {
                // The event was bound before mount by Svelte.
                events.push([eventType, callback]);
            }
            return () => {
                destructor();
            };
        };
        function forward(e) {
            // Internally bubble the event up from Svelte components.
            bubble(component, e);
        }
        return (node) => {
            const destructors = [];
            const forwardDestructors = {};
            // This function is responsible for listening and forwarding
            // all bound events.
            $on = (fullEventType, callback) => {
                let eventType = fullEventType;
                let handler = callback;
                // DOM addEventListener options argument.
                let options = false;
                const modifierMatch = eventType.match(modifierRegex);
                if (modifierMatch) {
                    // Parse the event modifiers.
                    // Supported modifiers:
                    // - preventDefault
                    // - stopPropagation
                    // - passive
                    // - nonpassive
                    // - capture
                    // - once
                    const parts = eventType.split(MODIFIER_DIVIDER);
                    eventType = parts[0];
                    const eventOptions = Object.fromEntries(parts.slice(1).map((mod) => [mod, true]));
                    if (eventOptions.passive) {
                        options = options || {};
                        options.passive = true;
                    }
                    if (eventOptions.nonpassive) {
                        options = options || {};
                        options.passive = false;
                    }
                    if (eventOptions.capture) {
                        options = options || {};
                        options.capture = true;
                    }
                    if (eventOptions.once) {
                        options = options || {};
                        options.once = true;
                    }
                    if (eventOptions.preventDefault) {
                        handler = prevent_default(handler);
                    }
                    if (eventOptions.stopPropagation) {
                        handler = stop_propagation(handler);
                    }
                }
                // Listen for the event directly, with the given options.
                const off = listen(node, eventType, handler, options);
                const destructor = () => {
                    off();
                    const idx = destructors.indexOf(destructor);
                    if (idx > -1) {
                        destructors.splice(idx, 1);
                    }
                };
                destructors.push(destructor);
                // Forward the event from Svelte.
                if (!(eventType in forwardDestructors)) {
                    forwardDestructors[eventType] = listen(node, eventType, forward);
                }
                return destructor;
            };
            for (let i = 0; i < events.length; i++) {
                // Listen to all the events added before mount.
                $on(events[i][0], events[i][1]);
            }
            return {
                destroy: () => {
                    // Remove all event listeners.
                    for (let i = 0; i < destructors.length; i++) {
                        destructors[i]();
                    }
                    // Remove all event forwarders.
                    for (const entry of Object.entries(forwardDestructors)) {
                        entry[1]();
                    }
                }
            };
        };
    }

    /** --------------------- */
    const key = {};
    function useSvelteUIThemeContext() {
        return getContext(key);
    }

    const colorScheme = writable('light');

    /* eslint-disable @typescript-eslint/ban-ts-comment */
    function useSvelteUITheme() {
        let observer;
        colorScheme?.subscribe((mode) => {
            observer = mode;
        });
        const DEFAULT_THEME = {
            // @ts-ignore
            ...theme,
            colorNames: colorNameMap,
            colorScheme: observer,
            dark: dark?.selector,
            fn: {
                themeColor: fns.themeColor,
                size: fns.size,
                radius: fns.radius,
                rgba: fns.rgba,
                variant: fns.variant
            }
        };
        return DEFAULT_THEME;
    }

    function themeColor(color, shade = 0) {
        const theme = useSvelteUIThemeContext()?.theme || useSvelteUITheme();
        let _shade = '50';
        if (!isSvelteUIColor(color))
            return color;
        if (shade !== Number(0))
            _shade = `${shade.toString()}00`;
        return theme.colors[`${color}${_shade}`]?.value;
    }
    function isSvelteUIColor(color) {
        let valid = false;
        switch (color) {
            case 'dark':
                valid = true;
                break;
            case 'gray':
                valid = true;
                break;
            case 'red':
                valid = true;
                break;
            case 'pink':
                valid = true;
                break;
            case 'grape':
                valid = true;
                break;
            case 'violet':
                valid = true;
                break;
            case 'indigo':
                valid = true;
                break;
            case 'blue':
                valid = true;
                break;
            case 'cyan':
                valid = true;
                break;
            case 'teal':
                valid = true;
                break;
            case 'green':
                valid = true;
                break;
            case 'lime':
                valid = true;
                break;
            case 'yellow':
                valid = true;
                break;
            case 'orange':
                valid = true;
                break;
            default:
                valid = false;
                break;
        }
        return valid;
    }

    function size(props) {
        if (typeof props.size === 'number') {
            return props.size;
        }
        if (typeof props.sizes[props.size] === 'number') {
            return props.sizes[props.size];
        }
        return +props.sizes[props.size]?.value || +props.sizes.md?.value;
    }

    function radius(radii) {
        const theme = useSvelteUIThemeContext()?.theme || useSvelteUITheme();
        if (typeof radii === 'number') {
            return radii;
        }
        return theme.radii[radii].value;
    }

    function isHexColor(hex) {
        const replaced = hex.replace('#', '');
        return (typeof replaced === 'string' && replaced.length === 6 && !Number.isNaN(Number(`0x${replaced}`)));
    }
    function hexToRgba(color) {
        const replaced = color.replace('#', '');
        const parsed = parseInt(replaced, 16);
        const r = (parsed >> 16) & 255;
        const g = (parsed >> 8) & 255;
        const b = parsed & 255;
        return {
            r,
            g,
            b,
            a: 1
        };
    }
    function rgbStringToRgba(color) {
        const [r, g, b, a] = color
            .replace(/[^0-9,.]/g, '')
            .split(',')
            .map(Number);
        return { r, g, b, a: a || 1 };
    }
    function toRgba(color) {
        if (isHexColor(color)) {
            return hexToRgba(color);
        }
        if (color.startsWith('rgb')) {
            return rgbStringToRgba(color);
        }
        return {
            r: 0,
            g: 0,
            b: 0,
            a: 1
        };
    }

    function randomID(prefix = 'svelteui') {
        return `${prefix}-${Math.random().toString(36).substring(2, 10)}`;
    }

    function rgba(color, alpha = 1) {
        if (typeof color !== 'string' || alpha > 1 || alpha < 0) {
            return 'rgba(0, 0, 0, 1)';
        }
        const { r, g, b } = toRgba(color);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    const DEFAULT_GRADIENT = {
        from: 'indigo',
        to: 'cyan',
        deg: 45
    };
    /**
     * THe Variant function is a function that takes a variant, optional color/gradient and returns the desired styles for four specific properties.
     *
     * Some styles will return tuples of strings where the first value is the dark version of the specific style, and the second value is the light version.
     *
     * @param VariantInput - an object that has a variant, color, and optional gradient property
     * @returns an object with border, background, color, and hover property styles based on the variant
     */
    function variant({ variant, color, gradient }) {
        const theme = useSvelteUIThemeContext()?.theme || useSvelteUITheme();
        const primaryShade = 6;
        if (variant === 'light') {
            return {
                border: 'transparent',
                background: [rgba(themeColor(color, 8), 0.35), rgba(themeColor(color, 0), 1)],
                color: [
                    color === 'dark' ? themeColor('dark', 0) : themeColor(color, 2),
                    color === 'dark' ? themeColor('dark', 9) : themeColor(color, primaryShade)
                ],
                // themeColor(color, theme.colorScheme === 'dark' ? 2 : getPrimaryShade('light')),
                hover: [rgba(themeColor(color, 7), 0.45), rgba(themeColor(color, 1), 0.65)]
            };
        }
        if (variant === 'default') {
            return {
                border: [themeColor('dark', 5), themeColor('gray', 4)],
                background: [themeColor('dark', 5), theme.colors.white.value],
                color: [theme.colors.white.value, theme.colors.black.value],
                hover: [themeColor('dark', 4), themeColor('gray', 0)]
            };
        }
        if (variant === 'white') {
            return {
                border: 'transparent',
                background: theme.colors.white.value,
                color: themeColor(color, primaryShade),
                hover: null
            };
        }
        if (variant === 'outline') {
            return {
                border: [themeColor(color, 4), themeColor(color, primaryShade)],
                background: 'transparent',
                color: [themeColor(color, 4), themeColor(color, primaryShade)],
                hover: [rgba(themeColor(color, 4), 0.05), rgba(themeColor(color, 0), 0.35)]
            };
        }
        if (variant === 'gradient') {
            const merged = {
                from: gradient?.from || DEFAULT_GRADIENT.from,
                to: gradient?.to || DEFAULT_GRADIENT.to,
                deg: gradient?.deg || DEFAULT_GRADIENT.deg
            };
            return {
                background: `linear-gradient(${merged.deg}deg, ${themeColor(merged.from, primaryShade)} 0%, ${themeColor(merged.to, primaryShade)} 100%)`,
                color: theme.colors.white.value,
                border: 'transparent',
                hover: null
            };
        }
        if (variant === 'subtle') {
            return {
                border: 'transparent',
                background: 'transparent',
                color: [
                    color === 'dark' ? themeColor('dark', 0) : themeColor(color, 2),
                    color === 'dark' ? themeColor('dark', 9) : themeColor(color, primaryShade)
                ],
                hover: [rgba(themeColor(color, 8), 0.35), rgba(themeColor(color, 0), 1)]
            };
        }
        return {
            border: 'transparent',
            background: [themeColor(color, 8), themeColor(color, primaryShade)],
            color: theme.colors.white.value,
            hover: themeColor(color, 7)
        };
    }

    const fns = {
        size,
        radius,
        themeColor,
        variant,
        rgba
    };

    const colors = {
        primary: '#228be6',
        white: '#ffffff',
        black: '#000000',
        dark50: '#C1C2C5',
        dark100: '#A6A7AB',
        dark200: '#909296',
        dark300: '#5c5f66',
        dark400: '#373A40',
        dark500: '#2C2E33',
        dark600: '#25262b',
        dark700: '#1A1B1E',
        dark800: '#141517',
        dark900: '#101113',
        gray50: '#f8f9fa',
        gray100: '#f1f3f5',
        gray200: '#e9ecef',
        gray300: '#dee2e6',
        gray400: '#ced4da',
        gray500: '#adb5bd',
        gray600: '#868e96',
        gray700: '#495057',
        gray800: '#343a40',
        gray900: '#212529',
        red50: '#fff5f5',
        red100: '#ffe3e3',
        red200: '#ffc9c9',
        red300: '#ffa8a8',
        red400: '#ff8787',
        red500: '#ff6b6b',
        red600: '#fa5252',
        red700: '#f03e3e',
        red800: '#e03131',
        red900: '#c92a2a',
        pink50: '#fff0f6',
        pink100: '#ffdeeb',
        pink200: '#fcc2d7',
        pink300: '#faa2c1',
        pink400: '#f783ac',
        pink500: '#f06595',
        pink600: '#e64980',
        pink700: '#d6336c',
        pink800: '#c2255c',
        pink900: '#a61e4d',
        grape50: '#f8f0fc',
        grape100: '#f3d9fa',
        grape200: '#eebefa',
        grape300: '#e599f7',
        grape400: '#da77f2',
        grape500: '#cc5de8',
        grape600: '#be4bdb',
        grape700: '#ae3ec9',
        grape800: '#9c36b5',
        grape900: '#862e9c',
        violet50: '#f3f0ff',
        violet100: '#e5dbff',
        violet200: '#d0bfff',
        violet300: '#b197fc',
        violet400: '#9775fa',
        violet500: '#845ef7',
        violet600: '#7950f2',
        violet700: '#7048e8',
        violet800: '#6741d9',
        violet900: '#5f3dc4',
        indigo50: '#edf2ff',
        indigo100: '#dbe4ff',
        indigo200: '#bac8ff',
        indigo300: '#91a7ff',
        indigo400: '#748ffc',
        indigo500: '#5c7cfa',
        indigo600: '#4c6ef5',
        indigo700: '#4263eb',
        indigo800: '#3b5bdb',
        indigo900: '#364fc7',
        blue50: '#e7f5ff',
        blue100: '#d0ebff',
        blue200: '#a5d8ff',
        blue300: '#74c0fc',
        blue400: '#4dabf7',
        blue500: '#339af0',
        blue600: '#228be6',
        blue700: '#1c7ed6',
        blue800: '#1971c2',
        blue900: '#1864ab',
        cyan50: '#e3fafc',
        cyan100: '#c5f6fa',
        cyan200: '#99e9f2',
        cyan300: '#66d9e8',
        cyan400: '#3bc9db',
        cyan500: '#22b8cf',
        cyan600: '#15aabf',
        cyan700: '#1098ad',
        cyan800: '#0c8599',
        cyan900: '#0b7285',
        teal50: '#e6fcf5',
        teal100: '#c3fae8',
        teal200: '#96f2d7',
        teal300: '#63e6be',
        teal400: '#38d9a9',
        teal500: '#20c997',
        teal600: '#12b886',
        teal700: '#0ca678',
        teal800: '#099268',
        teal900: '#087f5b',
        green50: '#ebfbee',
        green100: '#d3f9d8',
        green200: '#b2f2bb',
        green300: '#8ce99a',
        green400: '#69db7c',
        green500: '#51cf66',
        green600: '#40c057',
        green700: '#37b24d',
        green800: '#2f9e44',
        green900: '#2b8a3e',
        lime50: '#f4fce3',
        lime100: '#e9fac8',
        lime200: '#d8f5a2',
        lime300: '#c0eb75',
        lime400: '#a9e34b',
        lime500: '#94d82d',
        lime600: '#82c91e',
        lime700: '#74b816',
        lime800: '#66a80f',
        lime900: '#5c940d',
        yellow50: '#fff9db',
        yellow100: '#fff3bf',
        yellow200: '#ffec99',
        yellow300: '#ffe066',
        yellow400: '#ffd43b',
        yellow500: '#fcc419',
        yellow600: '#fab005',
        yellow700: '#f59f00',
        yellow800: '#f08c00',
        yellow900: '#e67700',
        orange50: '#fff4e6',
        orange100: '#ffe8cc',
        orange200: '#ffd8a8',
        orange300: '#ffc078',
        orange400: '#ffa94d',
        orange500: '#ff922b',
        orange600: '#fd7e14',
        orange700: '#f76707',
        orange800: '#e8590c',
        orange900: '#d9480f'
    };
    const colorNameMap = {
        blue: 'blue',
        cyan: 'cyan',
        dark: 'dark',
        grape: 'grape',
        gray: 'gray',
        green: 'green',
        indigo: 'indigo',
        lime: 'lime',
        orange: 'orange',
        pink: 'pink',
        red: 'red',
        teal: 'teal',
        violet: 'violet',
        yellow: 'yellow'
    };

    const hasOwn = {}.hasOwnProperty;
    function cx(...args) {
        const classes = [];
        for (let i = 0; i < args.length; i++) {
            const arg = args[i];
            if (!arg)
                continue;
            const argType = typeof arg;
            if (argType === 'string' || argType === 'number') {
                classes.push(arg);
            }
            else if (Array.isArray(arg)) {
                if (arg.length) {
                    const inner = { ...arg };
                    if (inner) {
                        classes.push(inner);
                    }
                }
            }
            else if (argType === 'object') {
                if (arg.toString === Object.prototype.toString) {
                    for (const key in arg) {
                        if (hasOwn.call(arg, key) && arg[key]) {
                            classes.push(key);
                        }
                    }
                }
                else {
                    classes.push(arg.toString());
                }
            }
        }
        return classes.join(' ');
    }
    function cssFactory() {
        // This is a factory function to allow for scalability
        return { cx };
    }

    function fromEntries(entries) {
        const o = {};
        Object.keys(entries).forEach((key) => {
            const [k, v] = entries[key];
            o[k] = v;
        });
        return o;
    }

    /* eslint-disable @typescript-eslint/no-unused-vars */
    const CLASS_KEY = 'svelteui';
    function createRef(refName) {
        return `__svelteui-ref-${refName || ''}`;
    }
    /**
     * Sanitizes the provided CSS object, converting certain keywords to
     * respective CSS selectors, transforms keys into generated CSS classes
     * and returns the mapping between these generated classes and their initial
     * keys.
     *
     * @param object The CSS object that has not yet been sanitized.
     * @param theme The current theme object.
     * @param ref The ref object.
     * @returns The class map that maps the name of the key in the CSS object
     * and the generated hash class.
     */
    function sanitizeCss(object, theme) {
        // builds this to map the generated class name to the class key
        // given in the CSS object
        const refs = [];
        const classMap = {};
        const _sanitize = (obj) => {
            Object.keys(obj).map((value) => {
                // transforms certain keywords into the correct CSS selectors
                if (value === 'variants')
                    return;
                // saves the reference value so that later it can be added
                // to reference the CSS selector
                if (value === 'ref') {
                    refs.push(obj.ref);
                }
                if (value === 'darkMode') {
                    obj[`${theme.dark} &`] = obj.darkMode;
                }
                // returns the recursive call if the CSS is not an object
                if (obj[value] === null || typeof obj[value] !== 'object')
                    return;
                // calls the sanitize method recursively so that it can sanitize
                // all the style objects
                _sanitize(obj[value]);
                // removes the darkMode style since it has been switched
                // to the correct CSS selector
                if (value === 'darkMode') {
                    delete obj[value];
                }
                else if (value.startsWith('@media')) ;
                // only adds the correct selectors if it has none
                else if (!value.startsWith('&') && !value.startsWith(theme.dark)) {
                    const getStyles = css(obj[value]);
                    classMap[value] = getStyles().toString();
                    obj[`& .${getStyles().toString()}`] = obj[value];
                    delete obj[value];
                }
            });
        };
        _sanitize(object);
        // deletes the root key since it won't be sanitized here
        delete object['& .root'];
        return { classMap, refs: Array.from(new Set(refs)) };
    }
    function createStyles(input) {
        const getCssObject = typeof input === 'function' ? input : () => input;
        function useStyles(params = {}, options) {
            // uses the theme present in the current context or fallbacks to the default theme
            const theme = useSvelteUIThemeContext()?.theme || useSvelteUITheme();
            const { cx } = cssFactory();
            const { override, name } = options || {};
            const dirtyCssObject = getCssObject(theme, params, createRef);
            // builds the CSS object that contains transformed values
            const sanitizedCss = Object.assign({}, dirtyCssObject);
            const { classMap, refs } = sanitizeCss(sanitizedCss, theme);
            const root = dirtyCssObject['root'] ?? undefined;
            const cssObjectClean = root !== undefined ? { ...root, ...sanitizedCss } : dirtyCssObject;
            const getStyles = css(cssObjectClean);
            // transforms the keys into strings to be consumed by the classes
            const classes = fromEntries(Object.keys(dirtyCssObject).map((keys) => {
                const ref = refs.find((r) => r.includes(keys)) ?? '';
                const getRefName = ref?.split('-') ?? [];
                const keyIsRef = ref?.split('-')[getRefName?.length - 1] === keys;
                const value = keys.toString();
                let transformedClasses = classMap[value] ?? value;
                // add the value to the array if the ref provided is valid
                if (ref && keyIsRef) {
                    transformedClasses = `${transformedClasses} ${ref}`;
                }
                // generates the root styles, applying the override styles
                if (keys === 'root') {
                    transformedClasses = getStyles({ css: override }).toString();
                }
                // adds a custom class that can be used to override style
                let libClass = `${CLASS_KEY}-${keys.toString()}`;
                if (name) {
                    libClass = `${CLASS_KEY}-${name}-${keys.toString()}`;
                    transformedClasses = `${transformedClasses} ${libClass}`;
                }
                return [keys, transformedClasses];
            }));
            return {
                cx,
                theme,
                classes,
                getStyles: css(cssObjectClean)
            };
        }
        return useStyles;
    }

    var t="colors",n="sizes",r="space",i={gap:r,gridGap:r,columnGap:r,gridColumnGap:r,rowGap:r,gridRowGap:r,inset:r,insetBlock:r,insetBlockEnd:r,insetBlockStart:r,insetInline:r,insetInlineEnd:r,insetInlineStart:r,margin:r,marginTop:r,marginRight:r,marginBottom:r,marginLeft:r,marginBlock:r,marginBlockEnd:r,marginBlockStart:r,marginInline:r,marginInlineEnd:r,marginInlineStart:r,padding:r,paddingTop:r,paddingRight:r,paddingBottom:r,paddingLeft:r,paddingBlock:r,paddingBlockEnd:r,paddingBlockStart:r,paddingInline:r,paddingInlineEnd:r,paddingInlineStart:r,top:r,right:r,bottom:r,left:r,scrollMargin:r,scrollMarginTop:r,scrollMarginRight:r,scrollMarginBottom:r,scrollMarginLeft:r,scrollMarginX:r,scrollMarginY:r,scrollMarginBlock:r,scrollMarginBlockEnd:r,scrollMarginBlockStart:r,scrollMarginInline:r,scrollMarginInlineEnd:r,scrollMarginInlineStart:r,scrollPadding:r,scrollPaddingTop:r,scrollPaddingRight:r,scrollPaddingBottom:r,scrollPaddingLeft:r,scrollPaddingX:r,scrollPaddingY:r,scrollPaddingBlock:r,scrollPaddingBlockEnd:r,scrollPaddingBlockStart:r,scrollPaddingInline:r,scrollPaddingInlineEnd:r,scrollPaddingInlineStart:r,fontSize:"fontSizes",background:t,backgroundColor:t,backgroundImage:t,borderImage:t,border:t,borderBlock:t,borderBlockEnd:t,borderBlockStart:t,borderBottom:t,borderBottomColor:t,borderColor:t,borderInline:t,borderInlineEnd:t,borderInlineStart:t,borderLeft:t,borderLeftColor:t,borderRight:t,borderRightColor:t,borderTop:t,borderTopColor:t,caretColor:t,color:t,columnRuleColor:t,fill:t,outline:t,outlineColor:t,stroke:t,textDecorationColor:t,fontFamily:"fonts",fontWeight:"fontWeights",lineHeight:"lineHeights",letterSpacing:"letterSpacings",blockSize:n,minBlockSize:n,maxBlockSize:n,inlineSize:n,minInlineSize:n,maxInlineSize:n,width:n,minWidth:n,maxWidth:n,height:n,minHeight:n,maxHeight:n,flexBasis:n,gridTemplateColumns:n,gridTemplateRows:n,borderWidth:"borderWidths",borderTopWidth:"borderWidths",borderRightWidth:"borderWidths",borderBottomWidth:"borderWidths",borderLeftWidth:"borderWidths",borderStyle:"borderStyles",borderTopStyle:"borderStyles",borderRightStyle:"borderStyles",borderBottomStyle:"borderStyles",borderLeftStyle:"borderStyles",borderRadius:"radii",borderTopLeftRadius:"radii",borderTopRightRadius:"radii",borderBottomRightRadius:"radii",borderBottomLeftRadius:"radii",boxShadow:"shadows",textShadow:"shadows",transition:"transitions",zIndex:"zIndices"},o=(e,t)=>"function"==typeof t?{"()":Function.prototype.toString.call(t)}:t,l=()=>{const e=Object.create(null);return (t,n,...r)=>{const i=(e=>JSON.stringify(e,o))(t);return i in e?e[i]:e[i]=n(t,...r)}},s=Symbol.for("sxs.internal"),a=(e,t)=>Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)),c=e=>{for(const t in e)return !0;return !1},{hasOwnProperty:d}=Object.prototype,g=e=>e.includes("-")?e:e.replace(/[A-Z]/g,(e=>"-"+e.toLowerCase())),p=/\s+(?![^()]*\))/,u=e=>t=>e(..."string"==typeof t?String(t).split(p):[t]),h={appearance:e=>({WebkitAppearance:e,appearance:e}),backfaceVisibility:e=>({WebkitBackfaceVisibility:e,backfaceVisibility:e}),backdropFilter:e=>({WebkitBackdropFilter:e,backdropFilter:e}),backgroundClip:e=>({WebkitBackgroundClip:e,backgroundClip:e}),boxDecorationBreak:e=>({WebkitBoxDecorationBreak:e,boxDecorationBreak:e}),clipPath:e=>({WebkitClipPath:e,clipPath:e}),content:e=>({content:e.includes('"')||e.includes("'")||/^([A-Za-z]+\([^]*|[^]*-quote|inherit|initial|none|normal|revert|unset)$/.test(e)?e:`"${e}"`}),hyphens:e=>({WebkitHyphens:e,hyphens:e}),maskImage:e=>({WebkitMaskImage:e,maskImage:e}),maskSize:e=>({WebkitMaskSize:e,maskSize:e}),tabSize:e=>({MozTabSize:e,tabSize:e}),textSizeAdjust:e=>({WebkitTextSizeAdjust:e,textSizeAdjust:e}),userSelect:e=>({WebkitUserSelect:e,userSelect:e}),marginBlock:u(((e,t)=>({marginBlockStart:e,marginBlockEnd:t||e}))),marginInline:u(((e,t)=>({marginInlineStart:e,marginInlineEnd:t||e}))),maxSize:u(((e,t)=>({maxBlockSize:e,maxInlineSize:t||e}))),minSize:u(((e,t)=>({minBlockSize:e,minInlineSize:t||e}))),paddingBlock:u(((e,t)=>({paddingBlockStart:e,paddingBlockEnd:t||e}))),paddingInline:u(((e,t)=>({paddingInlineStart:e,paddingInlineEnd:t||e})))},f=/([\d.]+)([^]*)/,m=(e,t)=>e.length?e.reduce(((e,n)=>(e.push(...t.map((e=>e.includes("&")?e.replace(/&/g,/[ +>|~]/.test(n)&&/&.*&/.test(e)?`:is(${n})`:n):n+" "+e))),e)),[]):t,b=(e,t)=>e in S&&"string"==typeof t?t.replace(/^((?:[^]*[^\w-])?)(fit-content|stretch)((?:[^\w-][^]*)?)$/,((t,n,r,i)=>n+("stretch"===r?`-moz-available${i};${g(e)}:${n}-webkit-fill-available`:`-moz-fit-content${i};${g(e)}:${n}fit-content`)+i)):String(t),S={blockSize:1,height:1,inlineSize:1,maxBlockSize:1,maxHeight:1,maxInlineSize:1,maxWidth:1,minBlockSize:1,minHeight:1,minInlineSize:1,minWidth:1,width:1},k=e=>e?e+"-":"",y=(e,t,n)=>e.replace(/([+-])?((?:\d+(?:\.\d*)?|\.\d+)(?:[Ee][+-]?\d+)?)?(\$|--)([$\w-]+)/g,((e,r,i,o,l)=>"$"==o==!!i?e:(r||"--"==o?"calc(":"")+"var(--"+("$"===o?k(t)+(l.includes("$")?"":k(n))+l.replace(/\$/g,"-"):l)+")"+(r||"--"==o?"*"+(r||"")+(i||"1")+")":""))),B=/\s*,\s*(?![^()]*\))/,$=Object.prototype.toString,x=(e,t,n,r,i)=>{let o,l,s;const a=(e,t,n)=>{let c,d;const p=e=>{for(c in e){const x=64===c.charCodeAt(0),z=x&&Array.isArray(e[c])?e[c]:[e[c]];for(d of z){const e=/[A-Z]/.test(S=c)?S:S.replace(/-[^]/g,(e=>e[1].toUpperCase())),z="object"==typeof d&&d&&d.toString===$&&(!r.utils[e]||!t.length);if(e in r.utils&&!z){const t=r.utils[e];if(t!==l){l=t,p(t(d)),l=null;continue}}else if(e in h){const t=h[e];if(t!==s){s=t,p(t(d)),s=null;continue}}if(x&&(u=c.slice(1)in r.media?"@media "+r.media[c.slice(1)]:c,c=u.replace(/\(\s*([\w-]+)\s*(=|<|<=|>|>=)\s*([\w-]+)\s*(?:(<|<=|>|>=)\s*([\w-]+)\s*)?\)/g,((e,t,n,r,i,o)=>{const l=f.test(t),s=.0625*(l?-1:1),[a,c]=l?[r,t]:[t,r];return "("+("="===n[0]?"":">"===n[0]===l?"max-":"min-")+a+":"+("="!==n[0]&&1===n.length?c.replace(f,((e,t,r)=>Number(t)+s*(">"===n?1:-1)+r)):c)+(i?") and ("+(">"===i[0]?"min-":"max-")+a+":"+(1===i.length?o.replace(f,((e,t,n)=>Number(t)+s*(">"===i?-1:1)+n)):o):"")+")"}))),z){const e=x?n.concat(c):[...n],r=x?[...t]:m(t,c.split(B));void 0!==o&&i(I(...o)),o=void 0,a(d,r,e);}else void 0===o&&(o=[[],t,n]),c=x||36!==c.charCodeAt(0)?c:`--${k(r.prefix)}${c.slice(1).replace(/\$/g,"-")}`,d=z?d:"number"==typeof d?d&&e in R?String(d)+"px":String(d):y(b(e,null==d?"":d),r.prefix,r.themeMap[e]),o[0].push(`${x?`${c} `:`${g(c)}:`}${d}`);}}var u,S;};p(e),void 0!==o&&i(I(...o)),o=void 0;};a(e,t,n);},I=(e,t,n)=>`${n.map((e=>`${e}{`)).join("")}${t.length?`${t.join(",")}{`:""}${e.join(";")}${t.length?"}":""}${Array(n.length?n.length+1:0).join("}")}`,R={animationDelay:1,animationDuration:1,backgroundSize:1,blockSize:1,border:1,borderBlock:1,borderBlockEnd:1,borderBlockEndWidth:1,borderBlockStart:1,borderBlockStartWidth:1,borderBlockWidth:1,borderBottom:1,borderBottomLeftRadius:1,borderBottomRightRadius:1,borderBottomWidth:1,borderEndEndRadius:1,borderEndStartRadius:1,borderInlineEnd:1,borderInlineEndWidth:1,borderInlineStart:1,borderInlineStartWidth:1,borderInlineWidth:1,borderLeft:1,borderLeftWidth:1,borderRadius:1,borderRight:1,borderRightWidth:1,borderSpacing:1,borderStartEndRadius:1,borderStartStartRadius:1,borderTop:1,borderTopLeftRadius:1,borderTopRightRadius:1,borderTopWidth:1,borderWidth:1,bottom:1,columnGap:1,columnRule:1,columnRuleWidth:1,columnWidth:1,containIntrinsicSize:1,flexBasis:1,fontSize:1,gap:1,gridAutoColumns:1,gridAutoRows:1,gridTemplateColumns:1,gridTemplateRows:1,height:1,inlineSize:1,inset:1,insetBlock:1,insetBlockEnd:1,insetBlockStart:1,insetInline:1,insetInlineEnd:1,insetInlineStart:1,left:1,letterSpacing:1,margin:1,marginBlock:1,marginBlockEnd:1,marginBlockStart:1,marginBottom:1,marginInline:1,marginInlineEnd:1,marginInlineStart:1,marginLeft:1,marginRight:1,marginTop:1,maxBlockSize:1,maxHeight:1,maxInlineSize:1,maxWidth:1,minBlockSize:1,minHeight:1,minInlineSize:1,minWidth:1,offsetDistance:1,offsetRotate:1,outline:1,outlineOffset:1,outlineWidth:1,overflowClipMargin:1,padding:1,paddingBlock:1,paddingBlockEnd:1,paddingBlockStart:1,paddingBottom:1,paddingInline:1,paddingInlineEnd:1,paddingInlineStart:1,paddingLeft:1,paddingRight:1,paddingTop:1,perspective:1,right:1,rowGap:1,scrollMargin:1,scrollMarginBlock:1,scrollMarginBlockEnd:1,scrollMarginBlockStart:1,scrollMarginBottom:1,scrollMarginInline:1,scrollMarginInlineEnd:1,scrollMarginInlineStart:1,scrollMarginLeft:1,scrollMarginRight:1,scrollMarginTop:1,scrollPadding:1,scrollPaddingBlock:1,scrollPaddingBlockEnd:1,scrollPaddingBlockStart:1,scrollPaddingBottom:1,scrollPaddingInline:1,scrollPaddingInlineEnd:1,scrollPaddingInlineStart:1,scrollPaddingLeft:1,scrollPaddingRight:1,scrollPaddingTop:1,shapeMargin:1,textDecoration:1,textDecorationThickness:1,textIndent:1,textUnderlineOffset:1,top:1,transitionDelay:1,transitionDuration:1,verticalAlign:1,width:1,wordSpacing:1},z=e=>String.fromCharCode(e+(e>25?39:97)),W=e=>(e=>{let t,n="";for(t=Math.abs(e);t>52;t=t/52|0)n=z(t%52)+n;return z(t%52)+n})(((e,t)=>{let n=t.length;for(;n;)e=33*e^t.charCodeAt(--n);return e})(5381,JSON.stringify(e))>>>0),j=["themed","global","styled","onevar","resonevar","allvar","inline"],E=e=>{if(e.href&&!e.href.startsWith(location.origin))return !1;try{return !!e.cssRules}catch(e){return !1}},T=e=>{let t;const n=()=>{const{cssRules:e}=t.sheet;return [].map.call(e,((n,r)=>{const{cssText:i}=n;let o="";if(i.startsWith("--sxs"))return "";if(e[r-1]&&(o=e[r-1].cssText).startsWith("--sxs")){if(!n.cssRules.length)return "";for(const e in t.rules)if(t.rules[e].group===n)return `--sxs{--sxs:${[...t.rules[e].cache].join(" ")}}${i}`;return n.cssRules.length?`${o}${i}`:""}return i})).join("")},r=()=>{if(t){const{rules:e,sheet:n}=t;if(!n.deleteRule){for(;3===Object(Object(n.cssRules)[0]).type;)n.cssRules.splice(0,1);n.cssRules=[];}for(const t in e)delete e[t];}const i=Object(e).styleSheets||[];for(const e of i)if(E(e)){for(let i=0,o=e.cssRules;o[i];++i){const l=Object(o[i]);if(1!==l.type)continue;const s=Object(o[i+1]);if(4!==s.type)continue;++i;const{cssText:a}=l;if(!a.startsWith("--sxs"))continue;const c=a.slice(14,-3).trim().split(/\s+/),d=j[c[0]];d&&(t||(t={sheet:e,reset:r,rules:{},toString:n}),t.rules[d]={group:s,index:i,cache:new Set(c)});}if(t)break}if(!t){const i=(e,t)=>({type:t,cssRules:[],insertRule(e,t){this.cssRules.splice(t,0,i(e,{import:3,undefined:1}[(e.toLowerCase().match(/^@([a-z]+)/)||[])[1]]||4));},get cssText(){return "@media{}"===e?`@media{${[].map.call(this.cssRules,(e=>e.cssText)).join("")}}`:e}});t={sheet:e?(e.head||e).appendChild(document.createElement("style")).sheet:i("","text/css"),rules:{},reset:r,toString:n};}const{sheet:o,rules:l}=t;for(let e=j.length-1;e>=0;--e){const t=j[e];if(!l[t]){const n=j[e+1],r=l[n]?l[n].index:o.cssRules.length;o.insertRule("@media{}",r),o.insertRule(`--sxs{--sxs:${e}}`,r),l[t]={group:o.cssRules[r+1],index:r,cache:new Set([e])};}v(l[t]);}};return r(),t},v=e=>{const t=e.group;let n=t.cssRules.length;e.apply=e=>{try{t.insertRule(e,n),++n;}catch(e){}};},M=Symbol(),w=l(),C=(e,t)=>w(e,(()=>(...n)=>{let r={type:null,composers:new Set};for(const t of n)if(null!=t)if(t[s]){null==r.type&&(r.type=t[s].type);for(const e of t[s].composers)r.composers.add(e);}else t.constructor!==Object||t.$$typeof?null==r.type&&(r.type=t):r.composers.add(P(t,e));return null==r.type&&(r.type="span"),r.composers.size||r.composers.add(["PJLV",{},[],[],{},[]]),L(e,r,t)})),P=({variants:e,compoundVariants:t,defaultVariants:n,...r},i)=>{const o=`${k(i.prefix)}c-${W(r)}`,l=[],s=[],a=Object.create(null),g=[];for(const e in n)a[e]=String(n[e]);if("object"==typeof e&&e)for(const t in e){p=a,u=t,d.call(p,u)||(a[t]="undefined");const n=e[t];for(const e in n){const r={[t]:String(e)};"undefined"===String(e)&&g.push(t);const i=n[e],o=[r,i,!c(i)];l.push(o);}}var p,u;if("object"==typeof t&&t)for(const e of t){let{css:t,...n}=e;t="object"==typeof t&&t||{};for(const e in n)n[e]=String(n[e]);const r=[n,t,!c(t)];s.push(r);}return [o,r,l,s,a,g]},L=(e,t,n)=>{const[r,i,o,l]=O(t.composers),c="function"==typeof t.type||t.type.$$typeof?(e=>{function t(){for(let n=0;n<t[M].length;n++){const[r,i]=t[M][n];e.rules[r].apply(i);}return t[M]=[],null}return t[M]=[],t.rules={},j.forEach((e=>t.rules[e]={apply:n=>t[M].push([e,n])})),t})(n):null,d=(c||n).rules,g=`.${r}${i.length>1?`:where(.${i.slice(1).join(".")})`:""}`,p=s=>{s="object"==typeof s&&s||D;const{css:a,...p}=s,u={};for(const e in o)if(delete p[e],e in s){let t=s[e];"object"==typeof t&&t?u[e]={"@initial":o[e],...t}:(t=String(t),u[e]="undefined"!==t||l.has(e)?t:o[e]);}else u[e]=o[e];const h=new Set([...i]);for(const[r,i,o,l]of t.composers){n.rules.styled.cache.has(r)||(n.rules.styled.cache.add(r),x(i,[`.${r}`],[],e,(e=>{d.styled.apply(e);})));const t=A(o,u,e.media),s=A(l,u,e.media,!0);for(const i of t)if(void 0!==i)for(const[t,o,l]of i){const i=`${r}-${W(o)}-${t}`;h.add(i);const s=(l?n.rules.resonevar:n.rules.onevar).cache,a=l?d.resonevar:d.onevar;s.has(i)||(s.add(i),x(o,[`.${i}`],[],e,(e=>{a.apply(e);})));}for(const t of s)if(void 0!==t)for(const[i,o]of t){const t=`${r}-${W(o)}-${i}`;h.add(t),n.rules.allvar.cache.has(t)||(n.rules.allvar.cache.add(t),x(o,[`.${t}`],[],e,(e=>{d.allvar.apply(e);})));}}if("object"==typeof a&&a){const t=`${r}-i${W(a)}-css`;h.add(t),n.rules.inline.cache.has(t)||(n.rules.inline.cache.add(t),x(a,[`.${t}`],[],e,(e=>{d.inline.apply(e);})));}for(const e of String(s.className||"").trim().split(/\s+/))e&&h.add(e);const f=p.className=[...h].join(" ");return {type:t.type,className:f,selector:g,props:p,toString:()=>f,deferredInjector:c}};return a(p,{className:r,selector:g,[s]:t,toString:()=>(n.rules.styled.cache.has(r)||p(),r)})},O=e=>{let t="";const n=[],r={},i=[];for(const[o,,,,l,s]of e){""===t&&(t=o),n.push(o),i.push(...s);for(const e in l){const t=l[e];(void 0===r[e]||"undefined"!==t||s.includes(t))&&(r[e]=t);}}return [t,n,r,new Set(i)]},A=(e,t,n,r)=>{const i=[];e:for(let[o,l,s]of e){if(s)continue;let e,a=0,c=!1;for(e in o){const r=o[e];let i=t[e];if(i!==r){if("object"!=typeof i||!i)continue e;{let e,t,o=0;for(const l in i){if(r===String(i[l])){if("@initial"!==l){const e=l.slice(1);(t=t||[]).push(e in n?n[e]:l.replace(/^@media ?/,"")),c=!0;}a+=o,e=!0;}++o;}if(t&&t.length&&(l={["@media "+t.join(", ")]:l}),!e)continue e}}}(i[a]=i[a]||[]).push([r?"cv":`${e}-${o[e]}`,l,c]);}return i},D={},H=l(),N=(e,t)=>H(e,(()=>(...n)=>{const r=()=>{for(let r of n){r="object"==typeof r&&r||{};let n=W(r);if(!t.rules.global.cache.has(n)){if(t.rules.global.cache.add(n),"@import"in r){let e=[].indexOf.call(t.sheet.cssRules,t.rules.themed.group)-1;for(let n of [].concat(r["@import"]))n=n.includes('"')||n.includes("'")?n:`"${n}"`,t.sheet.insertRule(`@import ${n};`,e++);delete r["@import"];}x(r,[],[],e,(e=>{t.rules.global.apply(e);}));}}return ""};return a(r,{toString:r})})),V=l(),G=(e,t)=>V(e,(()=>n=>{const r=`${k(e.prefix)}k-${W(n)}`,i=()=>{if(!t.rules.global.cache.has(r)){t.rules.global.cache.add(r);const i=[];x(n,[],[],e,(e=>i.push(e)));const o=`@keyframes ${r}{${i.join("")}}`;t.rules.global.apply(o);}return r};return a(i,{get name(){return i()},toString:i})})),F=class{constructor(e,t,n,r){this.token=null==e?"":String(e),this.value=null==t?"":String(t),this.scale=null==n?"":String(n),this.prefix=null==r?"":String(r);}get computedValue(){return "var("+this.variable+")"}get variable(){return "--"+k(this.prefix)+k(this.scale)+this.token}toString(){return this.computedValue}},J=l(),U=(e,t)=>J(e,(()=>(n,r)=>{r="object"==typeof n&&n||Object(r);const i=`.${n=(n="string"==typeof n?n:"")||`${k(e.prefix)}t-${W(r)}`}`,o={},l=[];for(const t in r){o[t]={};for(const n in r[t]){const i=`--${k(e.prefix)}${t}-${n}`,s=y(String(r[t][n]),e.prefix,t);o[t][n]=new F(n,s,t,e.prefix),l.push(`${i}:${s}`);}}const s=()=>{if(l.length&&!t.rules.themed.cache.has(n)){t.rules.themed.cache.add(n);const i=`${r===e.theme?":root,":""}.${n}{${l.join(";")}}`;t.rules.themed.apply(i);}return n};return {...o,get className(){return s()},selector:i,toString:s}})),Z=l(),X=e=>{let t=!1;const n=Z(e,(e=>{t=!0;const n="prefix"in(e="object"==typeof e&&e||{})?String(e.prefix):"",r="object"==typeof e.media&&e.media||{},o="object"==typeof e.root?e.root||null:globalThis.document||null,l="object"==typeof e.theme&&e.theme||{},s={prefix:n,media:r,theme:l,themeMap:"object"==typeof e.themeMap&&e.themeMap||{...i},utils:"object"==typeof e.utils&&e.utils||{}},a=T(o),c={css:C(s,a),globalCss:N(s,a),keyframes:G(s,a),createTheme:U(s,a),reset(){a.reset(),c.theme.toString();},theme:{},sheet:a,config:s,prefix:n,getCssText:a.toString,toString:a.toString};return String(c.theme=c.createTheme(l)),c}));return t||n.reset(),n};//# sourceMappingUrl=index.map

    const { css, globalCss, keyframes, getCssText, theme, createTheme, config, reset } = X({
        prefix: 'svelteui',
        theme: {
            colors,
            space: {
                0: '0rem',
                xs: 10,
                sm: 12,
                md: 16,
                lg: 20,
                xl: 24,
                xsPX: '10px',
                smPX: '12px',
                mdPX: '16px',
                lgPX: '20px',
                xlPX: '24px',
                1: '0.125rem',
                2: '0.25rem',
                3: '0.375rem',
                4: '0.5rem',
                5: '0.625rem',
                6: '0.75rem',
                7: '0.875rem',
                8: '1rem',
                9: '1.25rem',
                10: '1.5rem',
                11: '1.75rem',
                12: '2rem',
                13: '2.25rem',
                14: '2.5rem',
                15: '2.75rem',
                16: '3rem',
                17: '3.5rem',
                18: '4rem',
                20: '5rem',
                24: '6rem',
                28: '7rem',
                32: '8rem',
                36: '9rem',
                40: '10rem',
                44: '11rem',
                48: '12rem',
                52: '13rem',
                56: '14rem',
                60: '15rem',
                64: '16rem',
                72: '18rem',
                80: '20rem',
                96: '24rem'
            },
            fontSizes: {
                xs: '12px',
                sm: '14px',
                md: '16px',
                lg: '18px',
                xl: '20px'
            },
            fonts: {
                standard: '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji',
                mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace',
                fallback: 'Segoe UI, system-ui, sans-serif'
            },
            fontWeights: {
                thin: 100,
                extralight: 200,
                light: 300,
                normal: 400,
                medium: 500,
                semibold: 600,
                bold: 700,
                extrabold: 800
            },
            lineHeights: {
                xs: 1,
                sm: 1.25,
                md: 1.5,
                lg: 1.625,
                xl: 1.75
            },
            letterSpacings: {
                tighter: '-0.05em',
                tight: '-0.025em',
                normal: '0',
                wide: '0.025em',
                wider: '0.05em',
                widest: '0.1em'
            },
            sizes: {},
            radii: {
                xs: '2px',
                sm: '4px',
                md: '8px',
                lg: '16px',
                xl: '32px',
                squared: '33%',
                rounded: '50%',
                pill: '9999px'
            },
            shadows: {
                xs: '0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.1)',
                sm: '0 1px 3px rgba(0, 0, 0, 0.05), rgba(0, 0, 0, 0.05) 0px 10px 15px -5px, rgba(0, 0, 0, 0.04) 0px 7px 7px -5px',
                md: '0 1px 3px rgba(0, 0, 0, 0.05), rgba(0, 0, 0, 0.05) 0px 20px 25px -5px, rgba(0, 0, 0, 0.04) 0px 10px 10px -5px',
                lg: '0 1px 3px rgba(0, 0, 0, 0.05), rgba(0, 0, 0, 0.05) 0px 28px 23px -7px, rgba(0, 0, 0, 0.04) 0px 12px 12px -7px',
                xl: '0 1px 3px rgba(0, 0, 0, 0.05), rgba(0, 0, 0, 0.05) 0px 36px 28px -7px, rgba(0, 0, 0, 0.04) 0px 17px 17px -7px'
            },
            zIndices: {
                1: '100',
                2: '200',
                3: '300',
                4: '400',
                5: '500',
                10: '1000',
                max: '9999'
            },
            borderWidths: {
                light: '1px',
                normal: '2px',
                bold: '3px',
                extrabold: '4px',
                black: '5px',
                xs: '1px',
                sm: '2px',
                md: '3px',
                lg: '4px',
                xl: '5px'
            },
            breakpoints: {
                xs: 576,
                sm: 768,
                md: 992,
                lg: 1200,
                xl: 1400
            },
            borderStyles: {},
            transitions: {}
        },
        media: {
            xs: '(min-width: 576px)',
            sm: '(min-width: 768px)',
            md: '(min-width: 992px)',
            lg: '(min-width: 1200px)',
            xl: '(min-width: 1400px)'
        },
        utils: {
            focusRing: (value) => ({
                WebkitTapHighlightColor: 'transparent',
                '&:focus': {
                    outlineOffset: 2,
                    outline: value === 'always' || value === 'auto' ? '2px solid $primary' : 'none'
                },
                '&:focus:not(:focus-visible)': {
                    outline: value === 'auto' || value === 'never' ? 'none' : undefined
                }
            }),
            /** padding top */
            p: (value) => ({
                padding: value
            }),
            pt: (value) => ({
                paddingTop: value
            }),
            pr: (value) => ({
                paddingRight: value
            }),
            pb: (value) => ({
                paddingBottom: value
            }),
            pl: (value) => ({
                paddingLeft: value
            }),
            px: (value) => ({
                paddingLeft: value,
                paddingRight: value
            }),
            py: (value) => ({
                paddingTop: value,
                paddingBottom: value
            }),
            /** margin */
            m: (value) => ({
                margin: value
            }),
            /** margin-top */
            mt: (value) => ({
                marginTop: value
            }),
            mr: (value) => ({
                marginRight: value
            }),
            mb: (value) => ({
                marginBottom: value
            }),
            ml: (value) => ({
                marginLeft: value
            }),
            mx: (value) => ({
                marginLeft: value,
                marginRight: value
            }),
            my: (value) => ({
                marginTop: value,
                marginBottom: value
            }),
            ta: (value) => ({
                textAlign: value
            }),
            tt: (value) => ({
                textTransform: value
            }),
            to: (value) => ({
                textOverflow: value
            }),
            d: (value) => ({ display: value }),
            dflex: (value) => ({
                display: 'flex',
                alignItems: value,
                justifyContent: value
            }),
            fd: (value) => ({
                flexDirection: value
            }),
            fw: (value) => ({ flexWrap: value }),
            ai: (value) => ({
                alignItems: value
            }),
            ac: (value) => ({
                alignContent: value
            }),
            jc: (value) => ({
                justifyContent: value
            }),
            as: (value) => ({
                alignSelf: value
            }),
            fg: (value) => ({ flexGrow: value }),
            fs: (value) => ({
                fontSize: value
            }),
            fb: (value) => ({
                flexBasis: value
            }),
            bc: (value) => ({
                backgroundColor: value
            }),
            bf: (value) => ({
                backdropFilter: value
            }),
            bg: (value) => ({
                background: value
            }),
            bgBlur: (value) => ({
                bf: 'saturate(180%) blur(10px)',
                bg: value
            }),
            bgColor: (value) => ({
                backgroundColor: value
            }),
            backgroundClip: (value) => ({
                WebkitBackgroundClip: value,
                backgroundClip: value
            }),
            bgClip: (value) => ({
                WebkitBackgroundClip: value,
                backgroundClip: value
            }),
            br: (value) => ({
                borderRadius: value
            }),
            bw: (value) => ({
                borderWidth: value
            }),
            btrr: (value) => ({
                borderTopRightRadius: value
            }),
            bbrr: (value) => ({
                borderBottomRightRadius: value
            }),
            bblr: (value) => ({
                borderBottomLeftRadius: value
            }),
            btlr: (value) => ({
                borderTopLeftRadius: value
            }),
            bs: (value) => ({
                boxShadow: value
            }),
            normalShadow: (value) => ({
                boxShadow: `0 4px 14px 0 $${value}`
            }),
            lh: (value) => ({
                lineHeight: value
            }),
            ov: (value) => ({ overflow: value }),
            ox: (value) => ({
                overflowX: value
            }),
            oy: (value) => ({
                overflowY: value
            }),
            pe: (value) => ({
                pointerEvents: value
            }),
            events: (value) => ({
                pointerEvents: value
            }),
            us: (value) => ({
                WebkitUserSelect: value,
                userSelect: value
            }),
            userSelect: (value) => ({
                WebkitUserSelect: value,
                userSelect: value
            }),
            w: (value) => ({ width: value }),
            h: (value) => ({
                height: value
            }),
            minW: (value) => ({
                minWidth: value
            }),
            minH: (value) => ({
                minWidth: value
            }),
            mw: (value) => ({
                maxWidth: value
            }),
            maxW: (value) => ({
                maxWidth: value
            }),
            mh: (value) => ({
                maxHeight: value
            }),
            maxH: (value) => ({
                maxHeight: value
            }),
            size: (value) => ({
                width: value,
                height: value
            }),
            minSize: (value) => ({
                minWidth: value,
                minHeight: value,
                width: value,
                height: value
            }),
            sizeMin: (value) => ({
                minWidth: value,
                minHeight: value,
                width: value,
                height: value
            }),
            maxSize: (value) => ({
                maxWidth: value,
                maxHeight: value
            }),
            sizeMax: (value) => ({
                maxWidth: value,
                maxHeight: value
            }),
            appearance: (value) => ({
                WebkitAppearance: value,
                appearance: value
            }),
            scale: (value) => ({
                transform: `scale(${value})`
            }),
            linearGradient: (value) => ({
                backgroundImage: `linear-gradient(${value})`
            }),
            tdl: (value) => ({
                textDecorationLine: value
            }),
            // Text gradient effect
            textGradient: (value) => ({
                backgroundImage: `linear-gradient(${value})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
            })
        },
        themeMap: {
            ...i,
            width: 'space',
            height: 'space',
            minWidth: 'space',
            maxWidth: 'space',
            minHeight: 'space',
            maxHeight: 'space',
            flexBasis: 'space',
            gridTemplateColumns: 'space',
            gridTemplateRows: 'space',
            blockSize: 'space',
            minBlockSize: 'space',
            maxBlockSize: 'space',
            inlineSize: 'space',
            minInlineSize: 'space',
            maxInlineSize: 'space',
            borderWidth: 'borderWeights'
        }
    });
    /** Function for dark theme */
    const dark = createTheme('dark-theme', {
        colors,
        shadows: {
            xs: '-4px 0 15px rgb(0 0 0 / 50%)',
            sm: '0 5px 20px -5px rgba(20, 20, 20, 0.1)',
            md: '0 8px 30px rgba(20, 20, 20, 0.15)',
            lg: '0 30px 60px rgba(20, 20, 20, 0.15)',
            xl: '0 40px 80px rgba(20, 20, 20, 0.25)'
        }
    });
    /** Global styles for SvelteUI */
    globalCss({
        a: {
            focusRing: 'auto'
        },
        body: {
            [`${dark.selector} &`]: {
                backgroundColor: '$dark700',
                color: '$dark50'
            },
            backgroundColor: '$white',
            color: '$black'
        }
    });
    /** Normalize css function */
    globalCss({
        html: {
            fontFamily: 'sans-serif',
            lineHeight: '1.15',
            textSizeAdjust: '100%',
            margin: 0
        },
        body: {
            margin: 0
        },
        'article, aside, footer, header, nav, section, figcaption, figure, main': {
            display: 'block'
        },
        h1: {
            fontSize: '2em',
            margin: 0
        },
        hr: {
            boxSizing: 'content-box',
            height: 0,
            overflow: 'visible'
        },
        pre: {
            fontFamily: 'monospace, monospace',
            fontSize: '1em'
        },
        a: {
            background: 'transparent',
            textDecorationSkip: 'objects'
        },
        'a:active, a:hover': {
            outlineWidth: 0
        },
        'abbr[title]': {
            borderBottom: 'none',
            textDecoration: 'underline'
        },
        'b, strong': {
            fontWeight: 'bolder'
        },
        'code, kbp, samp': {
            fontFamily: 'monospace, monospace',
            fontSize: '1em'
        },
        dfn: {
            fontStyle: 'italic'
        },
        mark: {
            backgroundColor: '#ff0',
            color: '#000'
        },
        small: {
            fontSize: '80%'
        },
        'sub, sup': {
            fontSize: '75%',
            lineHeight: 0,
            position: 'relative',
            verticalAlign: 'baseline'
        },
        sup: {
            top: '-0.5em'
        },
        sub: {
            bottom: '-0.25em'
        },
        'audio, video': {
            display: 'inline-block'
        },
        'audio:not([controls])': {
            display: 'none',
            height: 0
        },
        img: {
            borderStyle: 'none',
            verticalAlign: 'middle'
        },
        'svg:not(:root)': {
            overflow: 'hidden'
        },
        'button, input, optgroup, select, textarea': {
            fontFamily: 'sans-serif',
            fontSize: '100%',
            lineHeight: '1.15',
            margin: 0
        },
        'button, input': {
            overflow: 'visible'
        },
        'button, select': {
            textTransform: 'none'
        },
        'button, [type=reset], [type=submit]': {
            WebkitAppearance: 'button'
        },
        'button::-moz-focus-inner, [type=button]::-moz-focus-inner, [type=reset]::-moz-focus-inner, [type=submit]::-moz-focus-inner': {
            borderStyle: 'none',
            padding: 0
        },
        'button:-moz-focusring, [type=button]:-moz-focusring, [type=reset]:-moz-focusring, [type=submit]:-moz-focusring': {
            outline: '1px dotted ButtonText'
        },
        legend: {
            boxSizing: 'border-box',
            color: 'inherit',
            display: 'table',
            maxWidth: '100%',
            padding: 0,
            whiteSpace: 'normal'
        },
        progress: {
            display: 'inline-block',
            verticalAlign: 'baseline'
        },
        textarea: {
            overflow: 'auto'
        },
        '[type=checkbox], [type=radio]': {
            boxSizing: 'border-box',
            padding: 0
        },
        '[type=number]::-webkit-inner-spin-button, [type=number]::-webkit-outer-spin-button': {
            height: 'auto'
        },
        '[type=search]': {
            appearance: 'textfield',
            outlineOffset: '-2px'
        },
        '[type=search]::-webkit-search-cancel-button, [type=search]::-webkit-search-decoration': {
            appearance: 'none'
        },
        '::-webkit-file-upload-button': {
            appearance: 'button',
            font: 'inherit'
        },
        'details, menu': {
            display: 'block'
        },
        summary: {
            display: 'list-item'
        },
        canvas: {
            display: 'inline-block'
        },
        template: {
            display: 'none'
        },
        '[hidden]': {
            display: 'none'
        }
    });

    const SYSTEM_PROPS = {
        mt: 'marginTop',
        mb: 'marginBottom',
        ml: 'marginLeft',
        mr: 'marginRight',
        pt: 'paddingTop',
        pb: 'paddingBottom',
        pl: 'paddingLeft',
        pr: 'paddingRight'
    };
    const NEGATIVE_VALUES = ['-xs', '-sm', '-md', '-lg', '-xl'];
    function isValidSizeValue(margin) {
        return typeof margin === 'string' || typeof margin === 'number';
    }
    function getSizeValue(margin, theme) {
        if (NEGATIVE_VALUES.includes(margin)) {
            return theme.fn.size({ size: margin.replace('-', ''), sizes: theme.space }) * -1;
        }
        return theme.fn.size({ size: margin, sizes: theme.space });
    }
    function getSystemStyles(systemStyles, theme) {
        const styles = {};
        if (isValidSizeValue(systemStyles.p)) {
            const value = getSizeValue(systemStyles.p, theme);
            styles.padding = value;
        }
        if (isValidSizeValue(systemStyles.m)) {
            const value = getSizeValue(systemStyles.m, theme);
            styles.margin = value;
        }
        if (isValidSizeValue(systemStyles.py)) {
            const value = getSizeValue(systemStyles.py, theme);
            styles.paddingTop = value;
            styles.paddingBottom = value;
        }
        if (isValidSizeValue(systemStyles.px)) {
            const value = getSizeValue(systemStyles.px, theme);
            styles.paddingLeft = value;
            styles.paddingRight = value;
        }
        if (isValidSizeValue(systemStyles.my)) {
            const value = getSizeValue(systemStyles.my, theme);
            styles.marginTop = value;
            styles.marginBottom = value;
        }
        if (isValidSizeValue(systemStyles.mx)) {
            const value = getSizeValue(systemStyles.mx, theme);
            styles.marginLeft = value;
            styles.marginRight = value;
        }
        Object.keys(SYSTEM_PROPS).forEach((property) => {
            if (isValidSizeValue(systemStyles[property])) {
                styles[SYSTEM_PROPS[property]] = theme.fn.size({
                    size: getSizeValue(systemStyles[property], theme),
                    sizes: theme.space
                });
            }
        });
        return styles;
    }

    /* node_modules/@svelteuidev/core/components/Box/Box.svelte generated by Svelte v3.59.1 */
    const file$4 = "node_modules/@svelteuidev/core/components/Box/Box.svelte";

    // (74:0) {:else}
    function create_else_block$1(ctx) {
    	let div;
    	let div_class_value;
    	let useActions_action;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[28].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[32], null);

    	let div_levels = [
    		{
    			class: div_class_value = "" + (/*className*/ ctx[2] + " " + /*BoxStyles*/ ctx[7]({
    				css: {
    					.../*getCSSStyles*/ ctx[11](/*theme*/ ctx[10]),
    					.../*systemStyles*/ ctx[6]
    				}
    			}))
    		},
    		/*$$restProps*/ ctx[12]
    	];

    	let div_data = {};

    	for (let i = 0; i < div_levels.length; i += 1) {
    		div_data = assign(div_data, div_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			set_attributes(div, div_data);
    			add_location(div, file$4, 74, 1, 2269);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			/*div_binding*/ ctx[31](div);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(/*forwardEvents*/ ctx[8].call(null, div)),
    					action_destroyer(useActions_action = useActions.call(null, div, /*use*/ ctx[1]))
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty[1] & /*$$scope*/ 2)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[32],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[32])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[32], dirty, null),
    						null
    					);
    				}
    			}

    			set_attributes(div, div_data = get_spread_update(div_levels, [
    				(!current || dirty[0] & /*className, BoxStyles, systemStyles*/ 196 && div_class_value !== (div_class_value = "" + (/*className*/ ctx[2] + " " + /*BoxStyles*/ ctx[7]({
    					css: {
    						.../*getCSSStyles*/ ctx[11](/*theme*/ ctx[10]),
    						.../*systemStyles*/ ctx[6]
    					}
    				})))) && { class: div_class_value },
    				dirty[0] & /*$$restProps*/ 4096 && /*$$restProps*/ ctx[12]
    			]));

    			if (useActions_action && is_function(useActions_action.update) && dirty[0] & /*use*/ 2) useActions_action.update.call(null, /*use*/ ctx[1]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    			/*div_binding*/ ctx[31](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(74:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (64:50) 
    function create_if_block_1$3(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;

    	const switch_instance_spread_levels = [
    		{
    			use: [/*forwardEvents*/ ctx[8], [useActions, /*use*/ ctx[1]]]
    		},
    		{
    			class: "" + (/*className*/ ctx[2] + " " + /*BoxStyles*/ ctx[7]({
    				css: {
    					.../*getCSSStyles*/ ctx[11](/*theme*/ ctx[10]),
    					.../*systemStyles*/ ctx[6]
    				}
    			}))
    		},
    		/*$$restProps*/ ctx[12]
    	];

    	var switch_value = /*root*/ ctx[3];

    	function switch_props(ctx) {
    		let switch_instance_props = {
    			$$slots: { default: [create_default_slot$4] },
    			$$scope: { ctx }
    		};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = construct_svelte_component_dev(switch_value, switch_props(ctx));
    		/*switch_instance_binding*/ ctx[30](switch_instance);
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) mount_component(switch_instance, target, anchor);
    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = (dirty[0] & /*forwardEvents, use, className, BoxStyles, getCSSStyles, theme, systemStyles, $$restProps*/ 7622)
    			? get_spread_update(switch_instance_spread_levels, [
    					dirty[0] & /*forwardEvents, use*/ 258 && {
    						use: [/*forwardEvents*/ ctx[8], [useActions, /*use*/ ctx[1]]]
    					},
    					dirty[0] & /*className, BoxStyles, getCSSStyles, theme, systemStyles*/ 3268 && {
    						class: "" + (/*className*/ ctx[2] + " " + /*BoxStyles*/ ctx[7]({
    							css: {
    								.../*getCSSStyles*/ ctx[11](/*theme*/ ctx[10]),
    								.../*systemStyles*/ ctx[6]
    							}
    						}))
    					},
    					dirty[0] & /*$$restProps*/ 4096 && get_spread_object(/*$$restProps*/ ctx[12])
    				])
    			: {};

    			if (dirty[1] & /*$$scope*/ 2) {
    				switch_instance_changes.$$scope = { dirty, ctx };
    			}

    			if (dirty[0] & /*root*/ 8 && switch_value !== (switch_value = /*root*/ ctx[3])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = construct_svelte_component_dev(switch_value, switch_props(ctx));
    					/*switch_instance_binding*/ ctx[30](switch_instance);
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			/*switch_instance_binding*/ ctx[30](null);
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$3.name,
    		type: "if",
    		source: "(64:50) ",
    		ctx
    	});

    	return block;
    }

    // (52:0) {#if isHTMLElement}
    function create_if_block$4(ctx) {
    	let current;
    	validate_dynamic_element(/*castRoot*/ ctx[9]());
    	validate_void_dynamic_element(/*castRoot*/ ctx[9]());
    	let svelte_element = /*castRoot*/ ctx[9]() && create_dynamic_element(ctx);

    	const block = {
    		c: function create() {
    			if (svelte_element) svelte_element.c();
    		},
    		m: function mount(target, anchor) {
    			if (svelte_element) svelte_element.m(target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*castRoot*/ ctx[9]()) {
    				svelte_element.p(ctx, dirty);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(svelte_element);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(svelte_element);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (svelte_element) svelte_element.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(52:0) {#if isHTMLElement}",
    		ctx
    	});

    	return block;
    }

    // (65:1) <svelte:component   this={root}   bind:this={element}   use={[forwardEvents, [useActions, use]]}   class="{className} {BoxStyles({ css: { ...getCSSStyles(theme), ...systemStyles } })}"   {...$$restProps}  >
    function create_default_slot$4(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[28].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[32], null);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty[1] & /*$$scope*/ 2)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[32],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[32])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[32], dirty, null),
    						null
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$4.name,
    		type: "slot",
    		source: "(65:1) <svelte:component   this={root}   bind:this={element}   use={[forwardEvents, [useActions, use]]}   class=\\\"{className} {BoxStyles({ css: { ...getCSSStyles(theme), ...systemStyles } })}\\\"   {...$$restProps}  >",
    		ctx
    	});

    	return block;
    }

    // (54:1) <svelte:element   bind:this={element}   this={castRoot()}   use:forwardEvents   use:useActions={use}   class="{className} {BoxStyles({ css: {...getCSSStyles(theme), ...systemStyles} })}"   {...$$restProps}  >
    function create_dynamic_element(ctx) {
    	let svelte_element;
    	let svelte_element_class_value;
    	let useActions_action;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[28].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[32], null);

    	let svelte_element_levels = [
    		{
    			class: svelte_element_class_value = "" + (/*className*/ ctx[2] + " " + /*BoxStyles*/ ctx[7]({
    				css: {
    					.../*getCSSStyles*/ ctx[11](/*theme*/ ctx[10]),
    					.../*systemStyles*/ ctx[6]
    				}
    			}))
    		},
    		/*$$restProps*/ ctx[12]
    	];

    	let svelte_element_data = {};

    	for (let i = 0; i < svelte_element_levels.length; i += 1) {
    		svelte_element_data = assign(svelte_element_data, svelte_element_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			svelte_element = element(/*castRoot*/ ctx[9]());
    			if (default_slot) default_slot.c();
    			set_dynamic_element_data(/*castRoot*/ ctx[9]())(svelte_element, svelte_element_data);
    			add_location(svelte_element, file$4, 53, 1, 1725);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svelte_element, anchor);

    			if (default_slot) {
    				default_slot.m(svelte_element, null);
    			}

    			/*svelte_element_binding*/ ctx[29](svelte_element);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(/*forwardEvents*/ ctx[8].call(null, svelte_element)),
    					action_destroyer(useActions_action = useActions.call(null, svelte_element, /*use*/ ctx[1]))
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty[1] & /*$$scope*/ 2)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[32],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[32])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[32], dirty, null),
    						null
    					);
    				}
    			}

    			set_dynamic_element_data(/*castRoot*/ ctx[9]())(svelte_element, svelte_element_data = get_spread_update(svelte_element_levels, [
    				(!current || dirty[0] & /*className, BoxStyles, systemStyles*/ 196 && svelte_element_class_value !== (svelte_element_class_value = "" + (/*className*/ ctx[2] + " " + /*BoxStyles*/ ctx[7]({
    					css: {
    						.../*getCSSStyles*/ ctx[11](/*theme*/ ctx[10]),
    						.../*systemStyles*/ ctx[6]
    					}
    				})))) && { class: svelte_element_class_value },
    				dirty[0] & /*$$restProps*/ 4096 && /*$$restProps*/ ctx[12]
    			]));

    			if (useActions_action && is_function(useActions_action.update) && dirty[0] & /*use*/ 2) useActions_action.update.call(null, /*use*/ ctx[1]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svelte_element);
    			if (default_slot) default_slot.d(detaching);
    			/*svelte_element_binding*/ ctx[29](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_dynamic_element.name,
    		type: "child_dynamic_element",
    		source: "(54:1) <svelte:element   bind:this={element}   this={castRoot()}   use:forwardEvents   use:useActions={use}   class=\\\"{className} {BoxStyles({ css: {...getCSSStyles(theme), ...systemStyles} })}\\\"   {...$$restProps}  >",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$4, create_if_block_1$3, create_else_block$1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*isHTMLElement*/ ctx[4]) return 0;
    		if (/*isComponent*/ ctx[5] && typeof /*root*/ ctx[3] !== 'string') return 1;
    		return 2;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let BoxStyles;
    	let systemStyles;

    	const omit_props_names = [
    		"use","element","class","css","root","m","my","mx","mt","mb","ml","mr","p","py","px","pt","pb","pl","pr"
    	];

    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Box', slots, ['default']);
    	let { use = [], element = undefined, class: className = '', css: css$1 = {}, root = undefined, m = undefined, my = undefined, mx = undefined, mt = undefined, mb = undefined, ml = undefined, mr = undefined, p = undefined, py = undefined, px = undefined, pt = undefined, pb = undefined, pl = undefined, pr = undefined } = $$props;

    	/** An action that forwards inner dom node events from parent component */
    	const forwardEvents = createEventForwarder(get_current_component());

    	/** workaround for root type errors, this should be replaced by a better type system */
    	const castRoot = () => root;

    	const theme = useSvelteUIThemeContext()?.theme || useSvelteUITheme();
    	const getCSSStyles = typeof css$1 === 'function' ? css$1 : () => css$1;
    	let isHTMLElement;
    	let isComponent;

    	function svelte_element_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			element = $$value;
    			$$invalidate(0, element);
    		});
    	}

    	function switch_instance_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			element = $$value;
    			$$invalidate(0, element);
    		});
    	}

    	function div_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			element = $$value;
    			$$invalidate(0, element);
    		});
    	}

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(12, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ('use' in $$new_props) $$invalidate(1, use = $$new_props.use);
    		if ('element' in $$new_props) $$invalidate(0, element = $$new_props.element);
    		if ('class' in $$new_props) $$invalidate(2, className = $$new_props.class);
    		if ('css' in $$new_props) $$invalidate(13, css$1 = $$new_props.css);
    		if ('root' in $$new_props) $$invalidate(3, root = $$new_props.root);
    		if ('m' in $$new_props) $$invalidate(14, m = $$new_props.m);
    		if ('my' in $$new_props) $$invalidate(15, my = $$new_props.my);
    		if ('mx' in $$new_props) $$invalidate(16, mx = $$new_props.mx);
    		if ('mt' in $$new_props) $$invalidate(17, mt = $$new_props.mt);
    		if ('mb' in $$new_props) $$invalidate(18, mb = $$new_props.mb);
    		if ('ml' in $$new_props) $$invalidate(19, ml = $$new_props.ml);
    		if ('mr' in $$new_props) $$invalidate(20, mr = $$new_props.mr);
    		if ('p' in $$new_props) $$invalidate(21, p = $$new_props.p);
    		if ('py' in $$new_props) $$invalidate(22, py = $$new_props.py);
    		if ('px' in $$new_props) $$invalidate(23, px = $$new_props.px);
    		if ('pt' in $$new_props) $$invalidate(24, pt = $$new_props.pt);
    		if ('pb' in $$new_props) $$invalidate(25, pb = $$new_props.pb);
    		if ('pl' in $$new_props) $$invalidate(26, pl = $$new_props.pl);
    		if ('pr' in $$new_props) $$invalidate(27, pr = $$new_props.pr);
    		if ('$$scope' in $$new_props) $$invalidate(32, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		getSystemStyles,
    		_css: css,
    		useSvelteUITheme,
    		useSvelteUIThemeContext,
    		createEventForwarder,
    		useActions,
    		get_current_component,
    		use,
    		element,
    		className,
    		css: css$1,
    		root,
    		m,
    		my,
    		mx,
    		mt,
    		mb,
    		ml,
    		mr,
    		p,
    		py,
    		px,
    		pt,
    		pb,
    		pl,
    		pr,
    		forwardEvents,
    		castRoot,
    		theme,
    		getCSSStyles,
    		isHTMLElement,
    		isComponent,
    		systemStyles,
    		BoxStyles
    	});

    	$$self.$inject_state = $$new_props => {
    		if ('use' in $$props) $$invalidate(1, use = $$new_props.use);
    		if ('element' in $$props) $$invalidate(0, element = $$new_props.element);
    		if ('className' in $$props) $$invalidate(2, className = $$new_props.className);
    		if ('css' in $$props) $$invalidate(13, css$1 = $$new_props.css);
    		if ('root' in $$props) $$invalidate(3, root = $$new_props.root);
    		if ('m' in $$props) $$invalidate(14, m = $$new_props.m);
    		if ('my' in $$props) $$invalidate(15, my = $$new_props.my);
    		if ('mx' in $$props) $$invalidate(16, mx = $$new_props.mx);
    		if ('mt' in $$props) $$invalidate(17, mt = $$new_props.mt);
    		if ('mb' in $$props) $$invalidate(18, mb = $$new_props.mb);
    		if ('ml' in $$props) $$invalidate(19, ml = $$new_props.ml);
    		if ('mr' in $$props) $$invalidate(20, mr = $$new_props.mr);
    		if ('p' in $$props) $$invalidate(21, p = $$new_props.p);
    		if ('py' in $$props) $$invalidate(22, py = $$new_props.py);
    		if ('px' in $$props) $$invalidate(23, px = $$new_props.px);
    		if ('pt' in $$props) $$invalidate(24, pt = $$new_props.pt);
    		if ('pb' in $$props) $$invalidate(25, pb = $$new_props.pb);
    		if ('pl' in $$props) $$invalidate(26, pl = $$new_props.pl);
    		if ('pr' in $$props) $$invalidate(27, pr = $$new_props.pr);
    		if ('isHTMLElement' in $$props) $$invalidate(4, isHTMLElement = $$new_props.isHTMLElement);
    		if ('isComponent' in $$props) $$invalidate(5, isComponent = $$new_props.isComponent);
    		if ('systemStyles' in $$props) $$invalidate(6, systemStyles = $$new_props.systemStyles);
    		if ('BoxStyles' in $$props) $$invalidate(7, BoxStyles = $$new_props.BoxStyles);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*root*/ 8) {
    			{
    				$$invalidate(4, isHTMLElement = root && typeof root === 'string');
    				$$invalidate(5, isComponent = root && typeof root === 'function');
    			}
    		}

    		if ($$self.$$.dirty[0] & /*m, my, mx, mt, mb, ml, mr, p, py, px, pt, pb, pl, pr*/ 268419072) {
    			$$invalidate(6, systemStyles = getSystemStyles(
    				{
    					m,
    					my,
    					mx,
    					mt,
    					mb,
    					ml,
    					mr,
    					p,
    					py,
    					px,
    					pt,
    					pb,
    					pl,
    					pr
    				},
    				theme
    			));
    		}
    	};

    	$$invalidate(7, BoxStyles = css({}));

    	return [
    		element,
    		use,
    		className,
    		root,
    		isHTMLElement,
    		isComponent,
    		systemStyles,
    		BoxStyles,
    		forwardEvents,
    		castRoot,
    		theme,
    		getCSSStyles,
    		$$restProps,
    		css$1,
    		m,
    		my,
    		mx,
    		mt,
    		mb,
    		ml,
    		mr,
    		p,
    		py,
    		px,
    		pt,
    		pb,
    		pl,
    		pr,
    		slots,
    		svelte_element_binding,
    		switch_instance_binding,
    		div_binding,
    		$$scope
    	];
    }

    class Box extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance$5,
    			create_fragment$5,
    			safe_not_equal,
    			{
    				use: 1,
    				element: 0,
    				class: 2,
    				css: 13,
    				root: 3,
    				m: 14,
    				my: 15,
    				mx: 16,
    				mt: 17,
    				mb: 18,
    				ml: 19,
    				mr: 20,
    				p: 21,
    				py: 22,
    				px: 23,
    				pt: 24,
    				pb: 25,
    				pl: 26,
    				pr: 27
    			},
    			null,
    			[-1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Box",
    			options,
    			id: create_fragment$5.name
    		});
    	}

    	get use() {
    		throw new Error("<Box>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set use(value) {
    		throw new Error("<Box>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get element() {
    		throw new Error("<Box>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set element(value) {
    		throw new Error("<Box>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get class() {
    		throw new Error("<Box>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Box>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get css() {
    		throw new Error("<Box>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set css(value) {
    		throw new Error("<Box>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get root() {
    		throw new Error("<Box>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set root(value) {
    		throw new Error("<Box>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get m() {
    		throw new Error("<Box>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set m(value) {
    		throw new Error("<Box>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get my() {
    		throw new Error("<Box>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set my(value) {
    		throw new Error("<Box>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get mx() {
    		throw new Error("<Box>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set mx(value) {
    		throw new Error("<Box>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get mt() {
    		throw new Error("<Box>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set mt(value) {
    		throw new Error("<Box>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get mb() {
    		throw new Error("<Box>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set mb(value) {
    		throw new Error("<Box>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get ml() {
    		throw new Error("<Box>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set ml(value) {
    		throw new Error("<Box>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get mr() {
    		throw new Error("<Box>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set mr(value) {
    		throw new Error("<Box>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get p() {
    		throw new Error("<Box>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set p(value) {
    		throw new Error("<Box>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get py() {
    		throw new Error("<Box>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set py(value) {
    		throw new Error("<Box>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get px() {
    		throw new Error("<Box>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set px(value) {
    		throw new Error("<Box>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get pt() {
    		throw new Error("<Box>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set pt(value) {
    		throw new Error("<Box>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get pb() {
    		throw new Error("<Box>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set pb(value) {
    		throw new Error("<Box>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get pl() {
    		throw new Error("<Box>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set pl(value) {
    		throw new Error("<Box>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get pr() {
    		throw new Error("<Box>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set pr(value) {
    		throw new Error("<Box>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var Box$1 = Box;

    function getTextColor(theme, color, variant, gradient, dark = false) {
        if (color === 'dimmed')
            return dark ? theme.fn.themeColor('dark', 2) : theme.fn.themeColor('gray', 6);
        if (variant === 'gradient' || gradient)
            return theme.fn.themeColor(color, 6);
        if (variant === 'link')
            return dark ? theme.fn.themeColor('blue', 4) : theme.fn.themeColor('blue', 7);
        if (variant === 'text')
            return dark ? theme.fn.themeColor(color, 5) : theme.fn.themeColor(color, 7);
    }
    var useStyles$1 = createStyles((theme, { align, color, inherit, inline, lineClamp, size, tracking, transform, underline, weight, gradient, variant }) => {
        return {
            root: {
                focusRing: 'auto',
                [`${theme.dark} &`]: {
                    color: color === 'dark' ? '$dark50' : getTextColor(theme, color, variant, gradient, true)
                },
                fontFamily: inherit ? 'inherit' : '$standard',
                fontSize: inherit ? 'inherit' : typeof size === 'string' ? `$${size}` : `${size}px`,
                fontWeight: inherit ? 'inherit' : `$${weight}`,
                letterSpacing: theme.letterSpacings[tracking]?.value,
                lineHeight: inherit
                    ? 'inherit'
                    : inline
                        ? 1
                        : typeof size === 'string'
                            ? `$${size}`
                            : `${size}px`,
                textTransform: transform,
                textDecoration: underline ? 'underline' : 'none',
                textAlign: align,
                cursor: variant === 'link' ? 'pointer' : 'inherit',
                color: color === 'green' ? 'Black' : getTextColor(theme, color, variant, gradient),
                backgroundImage: variant === 'gradient'
                    ? `linear-gradient(${gradient?.deg}deg, $${gradient?.from}600 0%, $${gradient?.to}600 100%)`
                    : null,
                WebkitBackgroundClip: variant === 'gradient' ? 'text' : null,
                WebkitTextFillColor: variant === 'gradient' ? 'transparent' : null,
                ...(lineClamp !== undefined
                    ? {
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: lineClamp,
                        WebkitBoxOrient: 'vertical'
                    }
                    : {}),
                '&:hover': variant === 'link' && underline === true
                    ? {
                        textDecoration: 'underline'
                    }
                    : undefined
            }
        };
    });

    /** Error codes for component Text
     *
     * `Object.freeze` is needed to keep modification outside of the object unavailable
     *
     * ## Code 1:
     * If using the 'gradient' prop, set 'variant' prop to 'gradient' to apply the gradient
     *
     * ## Code 2:
     * If using the 'link' variant, an href needs to be set and the root must be an anchor
     */
    const TextErrors = Object.freeze([
        {
            error: true,
            message: "If using the 'gradient' prop, set 'variant' prop to 'gradient' to apply the gradient",
            solution: `
                If your component looks like this:

                &lt;Text gradient={{from: 'blue', to: 'red', deg: 45}}&gt;Text string &lt;/Text&gt;
                                                                    ^^^ - Try adding prop variant='gradient'
                `
        },
        {
            error: true,
            message: "If using the 'link' variant, an href needs to be set and the root must be an anchor",
            solution: `
                If your component looks like this:

                &lt;Text variant='link'&gt;Text string &lt;/Text&gt;
                                    ^^^ - Try adding props href && root={'a'}'
                `
        }
    ]);

    /* node_modules/@svelteuidev/core/components/Text/Text.svelte generated by Svelte v3.59.1 */

    const { Error: Error_1 } = globals;

    // (55:0) <Box  {root}  bind:element  use={[forwardEvents, [useActions, use]]}  class={cx(className, classes.root, getStyles({ css: override }))}  href={href ?? undefined}  {...$$restProps} >
    function create_default_slot$3(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[25].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[27], null);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 134217728)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[27],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[27])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[27], dirty, null),
    						null
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$3.name,
    		type: "slot",
    		source: "(55:0) <Box  {root}  bind:element  use={[forwardEvents, [useActions, use]]}  class={cx(className, classes.root, getStyles({ css: override }))}  href={href ?? undefined}  {...$$restProps} >",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let error;
    	let t;
    	let box;
    	let updating_element;
    	let current;

    	error = new Error$2({
    			props: {
    				observable: /*observable*/ ctx[6],
    				component: "Text",
    				code: /*err*/ ctx[7]
    			},
    			$$inline: true
    		});

    	const box_spread_levels = [
    		{ root: /*root*/ ctx[4] },
    		{
    			use: [/*forwardEvents*/ ctx[11], [useActions, /*use*/ ctx[1]]]
    		},
    		{
    			class: /*cx*/ ctx[10](/*className*/ ctx[2], /*classes*/ ctx[9].root, /*getStyles*/ ctx[8]({ css: /*override*/ ctx[3] }))
    		},
    		{ href: /*href*/ ctx[5] ?? undefined },
    		/*$$restProps*/ ctx[12]
    	];

    	function box_element_binding(value) {
    		/*box_element_binding*/ ctx[26](value);
    	}

    	let box_props = {
    		$$slots: { default: [create_default_slot$3] },
    		$$scope: { ctx }
    	};

    	for (let i = 0; i < box_spread_levels.length; i += 1) {
    		box_props = assign(box_props, box_spread_levels[i]);
    	}

    	if (/*element*/ ctx[0] !== void 0) {
    		box_props.element = /*element*/ ctx[0];
    	}

    	box = new Box$1({ props: box_props, $$inline: true });
    	binding_callbacks.push(() => bind(box, 'element', box_element_binding));

    	const block = {
    		c: function create() {
    			create_component(error.$$.fragment);
    			t = space();
    			create_component(box.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error_1("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(error, target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(box, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const error_changes = {};
    			if (dirty & /*observable*/ 64) error_changes.observable = /*observable*/ ctx[6];
    			if (dirty & /*err*/ 128) error_changes.code = /*err*/ ctx[7];
    			error.$set(error_changes);

    			const box_changes = (dirty & /*root, forwardEvents, useActions, use, cx, className, classes, getStyles, override, href, undefined, $$restProps*/ 7998)
    			? get_spread_update(box_spread_levels, [
    					dirty & /*root*/ 16 && { root: /*root*/ ctx[4] },
    					dirty & /*forwardEvents, useActions, use*/ 2050 && {
    						use: [/*forwardEvents*/ ctx[11], [useActions, /*use*/ ctx[1]]]
    					},
    					dirty & /*cx, className, classes, getStyles, override*/ 1804 && {
    						class: /*cx*/ ctx[10](/*className*/ ctx[2], /*classes*/ ctx[9].root, /*getStyles*/ ctx[8]({ css: /*override*/ ctx[3] }))
    					},
    					dirty & /*href, undefined*/ 32 && { href: /*href*/ ctx[5] ?? undefined },
    					dirty & /*$$restProps*/ 4096 && get_spread_object(/*$$restProps*/ ctx[12])
    				])
    			: {};

    			if (dirty & /*$$scope*/ 134217728) {
    				box_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_element && dirty & /*element*/ 1) {
    				updating_element = true;
    				box_changes.element = /*element*/ ctx[0];
    				add_flush_callback(() => updating_element = false);
    			}

    			box.$set(box_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(error.$$.fragment, local);
    			transition_in(box.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(error.$$.fragment, local);
    			transition_out(box.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(error, detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(box, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let cx;
    	let classes;
    	let getStyles;

    	const omit_props_names = [
    		"use","element","class","override","align","color","root","transform","variant","size","weight","gradient","inline","lineClamp","underline","inherit","href","tracking"
    	];

    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Text', slots, ['default']);
    	let { use = [], element = undefined, class: className = '', override = {}, align = 'left', color = 'dark', root = undefined, transform = 'none', variant = 'text', size = 'md', weight = 'normal', gradient = { from: 'indigo', to: 'cyan', deg: 45 }, inline = true, lineClamp = undefined, underline = false, inherit = false, href = '', tracking = 'normal' } = $$props;

    	/** An action that forwards inner dom node events from parent component */
    	const forwardEvents = createEventForwarder(get_current_component());

    	// --------------Error Handling-------------------
    	let observable = false;

    	let err;

    	if (gradient.from === 'indigo' && gradient.to === 'cyan0' && gradient.deg === 45 && variant !== 'gradient') {
    		observable = true;
    		err = TextErrors[0];
    	}

    	function box_element_binding(value) {
    		element = value;
    		$$invalidate(0, element);
    	}

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(12, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ('use' in $$new_props) $$invalidate(1, use = $$new_props.use);
    		if ('element' in $$new_props) $$invalidate(0, element = $$new_props.element);
    		if ('class' in $$new_props) $$invalidate(2, className = $$new_props.class);
    		if ('override' in $$new_props) $$invalidate(3, override = $$new_props.override);
    		if ('align' in $$new_props) $$invalidate(13, align = $$new_props.align);
    		if ('color' in $$new_props) $$invalidate(14, color = $$new_props.color);
    		if ('root' in $$new_props) $$invalidate(4, root = $$new_props.root);
    		if ('transform' in $$new_props) $$invalidate(15, transform = $$new_props.transform);
    		if ('variant' in $$new_props) $$invalidate(16, variant = $$new_props.variant);
    		if ('size' in $$new_props) $$invalidate(17, size = $$new_props.size);
    		if ('weight' in $$new_props) $$invalidate(18, weight = $$new_props.weight);
    		if ('gradient' in $$new_props) $$invalidate(19, gradient = $$new_props.gradient);
    		if ('inline' in $$new_props) $$invalidate(20, inline = $$new_props.inline);
    		if ('lineClamp' in $$new_props) $$invalidate(21, lineClamp = $$new_props.lineClamp);
    		if ('underline' in $$new_props) $$invalidate(22, underline = $$new_props.underline);
    		if ('inherit' in $$new_props) $$invalidate(23, inherit = $$new_props.inherit);
    		if ('href' in $$new_props) $$invalidate(5, href = $$new_props.href);
    		if ('tracking' in $$new_props) $$invalidate(24, tracking = $$new_props.tracking);
    		if ('$$scope' in $$new_props) $$invalidate(27, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		get_current_component,
    		createEventForwarder,
    		useActions,
    		Error: Error$2,
    		Box: Box$1,
    		useStyles: useStyles$1,
    		TextErrors,
    		use,
    		element,
    		className,
    		override,
    		align,
    		color,
    		root,
    		transform,
    		variant,
    		size,
    		weight,
    		gradient,
    		inline,
    		lineClamp,
    		underline,
    		inherit,
    		href,
    		tracking,
    		forwardEvents,
    		observable,
    		err,
    		getStyles,
    		classes,
    		cx
    	});

    	$$self.$inject_state = $$new_props => {
    		if ('use' in $$props) $$invalidate(1, use = $$new_props.use);
    		if ('element' in $$props) $$invalidate(0, element = $$new_props.element);
    		if ('className' in $$props) $$invalidate(2, className = $$new_props.className);
    		if ('override' in $$props) $$invalidate(3, override = $$new_props.override);
    		if ('align' in $$props) $$invalidate(13, align = $$new_props.align);
    		if ('color' in $$props) $$invalidate(14, color = $$new_props.color);
    		if ('root' in $$props) $$invalidate(4, root = $$new_props.root);
    		if ('transform' in $$props) $$invalidate(15, transform = $$new_props.transform);
    		if ('variant' in $$props) $$invalidate(16, variant = $$new_props.variant);
    		if ('size' in $$props) $$invalidate(17, size = $$new_props.size);
    		if ('weight' in $$props) $$invalidate(18, weight = $$new_props.weight);
    		if ('gradient' in $$props) $$invalidate(19, gradient = $$new_props.gradient);
    		if ('inline' in $$props) $$invalidate(20, inline = $$new_props.inline);
    		if ('lineClamp' in $$props) $$invalidate(21, lineClamp = $$new_props.lineClamp);
    		if ('underline' in $$props) $$invalidate(22, underline = $$new_props.underline);
    		if ('inherit' in $$props) $$invalidate(23, inherit = $$new_props.inherit);
    		if ('href' in $$props) $$invalidate(5, href = $$new_props.href);
    		if ('tracking' in $$props) $$invalidate(24, tracking = $$new_props.tracking);
    		if ('observable' in $$props) $$invalidate(6, observable = $$new_props.observable);
    		if ('err' in $$props) $$invalidate(7, err = $$new_props.err);
    		if ('getStyles' in $$props) $$invalidate(8, getStyles = $$new_props.getStyles);
    		if ('classes' in $$props) $$invalidate(9, classes = $$new_props.classes);
    		if ('cx' in $$props) $$invalidate(10, cx = $$new_props.cx);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*lineClamp, underline, inline, inherit, gradient, variant, align, color, transform, size, weight, tracking*/ 33546240) {
    			// --------------End Error Handling-------------------
    			$$invalidate(
    				10,
    				{ cx, classes, getStyles } = useStyles$1(
    					{
    						lineClamp,
    						underline,
    						inline,
    						inherit,
    						gradient,
    						variant,
    						align,
    						color,
    						transform,
    						size,
    						weight,
    						tracking
    					},
    					{ name: 'Text' }
    				),
    				cx,
    				(((((((((((($$invalidate(9, classes), $$invalidate(21, lineClamp)), $$invalidate(22, underline)), $$invalidate(20, inline)), $$invalidate(23, inherit)), $$invalidate(19, gradient)), $$invalidate(16, variant)), $$invalidate(13, align)), $$invalidate(14, color)), $$invalidate(15, transform)), $$invalidate(17, size)), $$invalidate(18, weight)), $$invalidate(24, tracking)),
    				(((((((((((($$invalidate(8, getStyles), $$invalidate(21, lineClamp)), $$invalidate(22, underline)), $$invalidate(20, inline)), $$invalidate(23, inherit)), $$invalidate(19, gradient)), $$invalidate(16, variant)), $$invalidate(13, align)), $$invalidate(14, color)), $$invalidate(15, transform)), $$invalidate(17, size)), $$invalidate(18, weight)), $$invalidate(24, tracking))
    			);
    		}
    	};

    	return [
    		element,
    		use,
    		className,
    		override,
    		root,
    		href,
    		observable,
    		err,
    		getStyles,
    		classes,
    		cx,
    		forwardEvents,
    		$$restProps,
    		align,
    		color,
    		transform,
    		variant,
    		size,
    		weight,
    		gradient,
    		inline,
    		lineClamp,
    		underline,
    		inherit,
    		tracking,
    		slots,
    		box_element_binding,
    		$$scope
    	];
    }

    class Text extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {
    			use: 1,
    			element: 0,
    			class: 2,
    			override: 3,
    			align: 13,
    			color: 14,
    			root: 4,
    			transform: 15,
    			variant: 16,
    			size: 17,
    			weight: 18,
    			gradient: 19,
    			inline: 20,
    			lineClamp: 21,
    			underline: 22,
    			inherit: 23,
    			href: 5,
    			tracking: 24
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Text",
    			options,
    			id: create_fragment$4.name
    		});
    	}

    	get use() {
    		throw new Error_1("<Text>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set use(value) {
    		throw new Error_1("<Text>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get element() {
    		throw new Error_1("<Text>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set element(value) {
    		throw new Error_1("<Text>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get class() {
    		throw new Error_1("<Text>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error_1("<Text>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get override() {
    		throw new Error_1("<Text>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set override(value) {
    		throw new Error_1("<Text>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get align() {
    		throw new Error_1("<Text>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set align(value) {
    		throw new Error_1("<Text>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get color() {
    		throw new Error_1("<Text>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error_1("<Text>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get root() {
    		throw new Error_1("<Text>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set root(value) {
    		throw new Error_1("<Text>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get transform() {
    		throw new Error_1("<Text>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set transform(value) {
    		throw new Error_1("<Text>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get variant() {
    		throw new Error_1("<Text>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set variant(value) {
    		throw new Error_1("<Text>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get size() {
    		throw new Error_1("<Text>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set size(value) {
    		throw new Error_1("<Text>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get weight() {
    		throw new Error_1("<Text>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set weight(value) {
    		throw new Error_1("<Text>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get gradient() {
    		throw new Error_1("<Text>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set gradient(value) {
    		throw new Error_1("<Text>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get inline() {
    		throw new Error_1("<Text>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set inline(value) {
    		throw new Error_1("<Text>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get lineClamp() {
    		throw new Error_1("<Text>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set lineClamp(value) {
    		throw new Error_1("<Text>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get underline() {
    		throw new Error_1("<Text>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set underline(value) {
    		throw new Error_1("<Text>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get inherit() {
    		throw new Error_1("<Text>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set inherit(value) {
    		throw new Error_1("<Text>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get href() {
    		throw new Error_1("<Text>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set href(value) {
    		throw new Error_1("<Text>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get tracking() {
    		throw new Error_1("<Text>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tracking(value) {
    		throw new Error_1("<Text>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var Text$1 = Text;

    function getCumulativeSections(sections) {
        return sections.reduce((acc, section) => {
            acc.sections.push({ ...section, accumulated: acc.accumulated });
            acc.accumulated += section.value;
            return acc;
        }, { accumulated: 0, sections: [] }).sections;
    }
    const sizes = {
        xs: 3,
        sm: 5,
        md: 8,
        lg: 12,
        xl: 16
    };
    const stripesAnimation = keyframes({
        from: { backgroundPosition: '0 0' },
        to: { backgroundPosition: '40px 0' }
    });
    var useStyles = createStyles((theme, { color, radius, size, striped, animate, shade }) => ({
        root: {
            [`${theme.dark} &`]: {
                backgroundColor: theme.fn.themeColor('dark', 4)
            },
            position: 'relative',
            height: theme.fn.size({ size, sizes }),
            backgroundColor: theme.fn.themeColor('gray', 2),
            borderRadius: theme.fn.radius(radius),
            overflow: 'hidden'
        },
        bar: {
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: 0,
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: theme.fn.themeColor(color || 'blue', shade),
            transition: 'width 100ms linear',
            animation: animate ? `${stripesAnimation} 1000ms linear infinite` : 'none',
            backgroundSize: '20px 20px',
            backgroundImage: striped
                ? 'linear-gradient(45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent)'
                : 'none',
            '&:last-of-type': {
                borderTopRightRadius: theme.fn.radius(radius),
                borderBottomRightRadius: theme.fn.radius(radius)
            },
            '&:first-of-type': {
                borderTopLeftRadius: theme.fn.radius(radius),
                borderBottomLeftRadius: theme.fn.radius(radius)
            },
            '@media (prefers-reduced-motion)': {
                transitionDuration: '0ms'
            }
        },
        label: {
            color: theme.colors.white.value,
            fontSize: theme.fn.size({ size, sizes }) * 0.65,
            fontWeight: 700,
            userSelect: 'none',
            overflow: 'hidden',
            whiteSpace: 'nowrap'
        }
    }));

    function is_date(obj) {
        return Object.prototype.toString.call(obj) === '[object Date]';
    }

    function get_interpolator(a, b) {
        if (a === b || a !== a)
            return () => a;
        const type = typeof a;
        if (type !== typeof b || Array.isArray(a) !== Array.isArray(b)) {
            throw new Error('Cannot interpolate values of different type');
        }
        if (Array.isArray(a)) {
            const arr = b.map((bi, i) => {
                return get_interpolator(a[i], bi);
            });
            return t => arr.map(fn => fn(t));
        }
        if (type === 'object') {
            if (!a || !b)
                throw new Error('Object cannot be null');
            if (is_date(a) && is_date(b)) {
                a = a.getTime();
                b = b.getTime();
                const delta = b - a;
                return t => new Date(a + t * delta);
            }
            const keys = Object.keys(b);
            const interpolators = {};
            keys.forEach(key => {
                interpolators[key] = get_interpolator(a[key], b[key]);
            });
            return t => {
                const result = {};
                keys.forEach(key => {
                    result[key] = interpolators[key](t);
                });
                return result;
            };
        }
        if (type === 'number') {
            const delta = b - a;
            return t => a + t * delta;
        }
        throw new Error(`Cannot interpolate ${type} values`);
    }
    function tweened(value, defaults = {}) {
        const store = writable(value);
        let task;
        let target_value = value;
        function set(new_value, opts) {
            if (value == null) {
                store.set(value = new_value);
                return Promise.resolve();
            }
            target_value = new_value;
            let previous_task = task;
            let started = false;
            let { delay = 0, duration = 400, easing = identity, interpolate = get_interpolator } = assign(assign({}, defaults), opts);
            if (duration === 0) {
                if (previous_task) {
                    previous_task.abort();
                    previous_task = null;
                }
                store.set(value = target_value);
                return Promise.resolve();
            }
            const start = now() + delay;
            let fn;
            task = loop(now => {
                if (now < start)
                    return true;
                if (!started) {
                    fn = interpolate(value, new_value);
                    if (typeof duration === 'function')
                        duration = duration(value, new_value);
                    started = true;
                }
                if (previous_task) {
                    previous_task.abort();
                    previous_task = null;
                }
                const elapsed = now - start;
                if (elapsed > duration) {
                    store.set(value = new_value);
                    return false;
                }
                // @ts-ignore
                store.set(value = fn(easing(elapsed / duration)));
                return true;
            });
            return task.promise;
        }
        return {
            set,
            update: (fn, opts) => set(fn(target_value, value), opts),
            subscribe: store.subscribe
        };
    }

    /* node_modules/@svelteuidev/core/components/Progress/Progress.svelte generated by Svelte v3.59.1 */
    const file$3 = "node_modules/@svelteuidev/core/components/Progress/Progress.svelte";
    const get_label_slot_changes = dirty => ({});
    const get_label_slot_context = ctx => ({});

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[28] = list[i];
    	return child_ctx;
    }

    // (39:1) {:else}
    function create_else_block(ctx) {
    	let div;
    	let current_block_type_index;
    	let if_block;
    	let div_class_value;
    	let div_style_value;
    	let current;
    	const if_block_creators = [create_if_block_2, create_if_block_3];
    	const if_blocks = [];

    	function select_block_type_1(ctx, dirty) {
    		if (/*$$slots*/ ctx[17].label) return 0;
    		if (/*label*/ ctx[5]) return 1;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type_1(ctx))) {
    		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (if_block) if_block.c();
    			attr_dev(div, "class", div_class_value = /*classes*/ ctx[12].bar);
    			attr_dev(div, "role", "progressbar");
    			attr_dev(div, "aria-valuemax", 100);
    			attr_dev(div, "aria-valuemin", 0);
    			attr_dev(div, "aria-valuenow", /*value*/ ctx[4]);
    			attr_dev(div, "aria-label", /*ariaLabel*/ ctx[8]);

    			attr_dev(div, "style", div_style_value = `width:${/*tween*/ ctx[9]
			? /*$progress*/ ctx[15]
			: /*value*/ ctx[4]}%`);

    			add_location(div, file$3, 39, 2, 1509);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type_1(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if (~current_block_type_index) {
    					if_blocks[current_block_type_index].p(ctx, dirty);
    				}
    			} else {
    				if (if_block) {
    					group_outros();

    					transition_out(if_blocks[previous_block_index], 1, 1, () => {
    						if_blocks[previous_block_index] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index) {
    					if_block = if_blocks[current_block_type_index];

    					if (!if_block) {
    						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    						if_block.c();
    					} else {
    						if_block.p(ctx, dirty);
    					}

    					transition_in(if_block, 1);
    					if_block.m(div, null);
    				} else {
    					if_block = null;
    				}
    			}

    			if (!current || dirty & /*classes*/ 4096 && div_class_value !== (div_class_value = /*classes*/ ctx[12].bar)) {
    				attr_dev(div, "class", div_class_value);
    			}

    			if (!current || dirty & /*value*/ 16) {
    				attr_dev(div, "aria-valuenow", /*value*/ ctx[4]);
    			}

    			if (!current || dirty & /*ariaLabel*/ 256) {
    				attr_dev(div, "aria-label", /*ariaLabel*/ ctx[8]);
    			}

    			if (!current || dirty & /*tween, $progress, value*/ 33296 && div_style_value !== (div_style_value = `width:${/*tween*/ ctx[9]
			? /*$progress*/ ctx[15]
			: /*value*/ ctx[4]}%`)) {
    				attr_dev(div, "style", div_style_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d();
    			}
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(39:1) {:else}",
    		ctx
    	});

    	return block;
    }

    // (24:1) {#if segments}
    function create_if_block$3(ctx) {
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let each_1_anchor;
    	let current;
    	let each_value = getCumulativeSections(/*sections*/ ctx[6]);
    	validate_each_argument(each_value);
    	const get_key = ctx => /*section*/ ctx[28];
    	validate_each_keys(ctx, each_value, get_each_context$1, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$1(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$1(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(target, anchor);
    				}
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*classes, tween, $progress, getCumulativeSections, sections, theme, shade*/ 38592) {
    				each_value = getCumulativeSections(/*sections*/ ctx[6]);
    				validate_each_argument(each_value);
    				group_outros();
    				validate_each_keys(ctx, each_value, get_each_context$1, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, each_1_anchor.parentNode, outro_and_destroy_block, create_each_block$1, each_1_anchor, get_each_context$1);
    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d(detaching);
    			}

    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(24:1) {#if segments}",
    		ctx
    	});

    	return block;
    }

    // (51:19) 
    function create_if_block_3(ctx) {
    	let text_1;
    	let current;

    	text_1 = new Text$1({
    			props: {
    				class: /*classes*/ ctx[12].label,
    				$$slots: { default: [create_default_slot_3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(text_1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(text_1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const text_1_changes = {};
    			if (dirty & /*classes*/ 4096) text_1_changes.class = /*classes*/ ctx[12].label;

    			if (dirty & /*$$scope, label*/ 67108896) {
    				text_1_changes.$$scope = { dirty, ctx };
    			}

    			text_1.$set(text_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(text_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(text_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(text_1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(51:19) ",
    		ctx
    	});

    	return block;
    }

    // (49:3) {#if $$slots.label}
    function create_if_block_2(ctx) {
    	let current;
    	const label_slot_template = /*#slots*/ ctx[24].label;
    	const label_slot = create_slot(label_slot_template, ctx, /*$$scope*/ ctx[26], get_label_slot_context);

    	const block = {
    		c: function create() {
    			if (label_slot) label_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (label_slot) {
    				label_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (label_slot) {
    				if (label_slot.p && (!current || dirty & /*$$scope*/ 67108864)) {
    					update_slot_base(
    						label_slot,
    						label_slot_template,
    						ctx,
    						/*$$scope*/ ctx[26],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[26])
    						: get_slot_changes(label_slot_template, /*$$scope*/ ctx[26], dirty, get_label_slot_changes),
    						get_label_slot_context
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(label_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(label_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (label_slot) label_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(49:3) {#if $$slots.label}",
    		ctx
    	});

    	return block;
    }

    // (52:4) <Text class={classes.label}>
    function create_default_slot_3(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text(/*label*/ ctx[5]);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*label*/ 32) set_data_dev(t, /*label*/ ctx[5]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3.name,
    		type: "slot",
    		source: "(52:4) <Text class={classes.label}>",
    		ctx
    	});

    	return block;
    }

    // (34:4) {#if section.label}
    function create_if_block_1$2(ctx) {
    	let text_1;
    	let current;

    	text_1 = new Text$1({
    			props: {
    				class: /*classes*/ ctx[12].label,
    				$$slots: { default: [create_default_slot_2$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(text_1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(text_1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const text_1_changes = {};
    			if (dirty & /*classes*/ 4096) text_1_changes.class = /*classes*/ ctx[12].label;

    			if (dirty & /*$$scope, sections*/ 67108928) {
    				text_1_changes.$$scope = { dirty, ctx };
    			}

    			text_1.$set(text_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(text_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(text_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(text_1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(34:4) {#if section.label}",
    		ctx
    	});

    	return block;
    }

    // (35:5) <Text class={classes.label}>
    function create_default_slot_2$1(ctx) {
    	let t_value = /*section*/ ctx[28].label + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*sections*/ 64 && t_value !== (t_value = /*section*/ ctx[28].label + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2$1.name,
    		type: "slot",
    		source: "(35:5) <Text class={classes.label}>",
    		ctx
    	});

    	return block;
    }

    // (26:3) <Box     class={classes.bar}     css={{      width: `${tween ? $progress : section.value}% !important`,      left: `${section.accumulated}% !important`,      backgroundColor: `${theme.fn.themeColor(section.color, shade)} !important`     }}    >
    function create_default_slot_1$1(ctx) {
    	let t;
    	let current;
    	let if_block = /*section*/ ctx[28].label && create_if_block_1$2(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			t = space();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, t, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*section*/ ctx[28].label) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*sections*/ 64) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_1$2(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(t.parentNode, t);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$1.name,
    		type: "slot",
    		source: "(26:3) <Box     class={classes.bar}     css={{      width: `${tween ? $progress : section.value}% !important`,      left: `${section.accumulated}% !important`,      backgroundColor: `${theme.fn.themeColor(section.color, shade)} !important`     }}    >",
    		ctx
    	});

    	return block;
    }

    // (25:2) {#each getCumulativeSections(sections) as section (section)}
    function create_each_block$1(key_1, ctx) {
    	let first;
    	let box;
    	let current;

    	box = new Box$1({
    			props: {
    				class: /*classes*/ ctx[12].bar,
    				css: {
    					width: `${/*tween*/ ctx[9]
					? /*$progress*/ ctx[15]
					: /*section*/ ctx[28].value}% !important`,
    					left: `${/*section*/ ctx[28].accumulated}% !important`,
    					backgroundColor: `${/*theme*/ ctx[10].fn.themeColor(/*section*/ ctx[28].color, /*shade*/ ctx[7])} !important`
    				},
    				$$slots: { default: [create_default_slot_1$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			first = empty();
    			create_component(box.$$.fragment);
    			this.first = first;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, first, anchor);
    			mount_component(box, target, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const box_changes = {};
    			if (dirty & /*classes*/ 4096) box_changes.class = /*classes*/ ctx[12].bar;

    			if (dirty & /*tween, $progress, sections, theme, shade*/ 34496) box_changes.css = {
    				width: `${/*tween*/ ctx[9]
				? /*$progress*/ ctx[15]
				: /*section*/ ctx[28].value}% !important`,
    				left: `${/*section*/ ctx[28].accumulated}% !important`,
    				backgroundColor: `${/*theme*/ ctx[10].fn.themeColor(/*section*/ ctx[28].color, /*shade*/ ctx[7])} !important`
    			};

    			if (dirty & /*$$scope, classes, sections*/ 67113024) {
    				box_changes.$$scope = { dirty, ctx };
    			}

    			box.$set(box_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(box.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(box.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(first);
    			destroy_component(box, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(25:2) {#each getCumulativeSections(sections) as section (section)}",
    		ctx
    	});

    	return block;
    }

    // (23:0) <Box bind:element {use} class={cx(className, classes.root, getStyles({ css: override }))}>
    function create_default_slot$2(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$3, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*segments*/ ctx[14]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$2.name,
    		type: "slot",
    		source: "(23:0) <Box bind:element {use} class={cx(className, classes.root, getStyles({ css: override }))}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let box;
    	let updating_element;
    	let current;

    	function box_element_binding(value) {
    		/*box_element_binding*/ ctx[25](value);
    	}

    	let box_props = {
    		use: /*use*/ ctx[1],
    		class: /*cx*/ ctx[13](/*className*/ ctx[2], /*classes*/ ctx[12].root, /*getStyles*/ ctx[11]({ css: /*override*/ ctx[3] })),
    		$$slots: { default: [create_default_slot$2] },
    		$$scope: { ctx }
    	};

    	if (/*element*/ ctx[0] !== void 0) {
    		box_props.element = /*element*/ ctx[0];
    	}

    	box = new Box$1({ props: box_props, $$inline: true });
    	binding_callbacks.push(() => bind(box, 'element', box_element_binding));

    	const block = {
    		c: function create() {
    			create_component(box.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(box, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const box_changes = {};
    			if (dirty & /*use*/ 2) box_changes.use = /*use*/ ctx[1];
    			if (dirty & /*cx, className, classes, getStyles, override*/ 14348) box_changes.class = /*cx*/ ctx[13](/*className*/ ctx[2], /*classes*/ ctx[12].root, /*getStyles*/ ctx[11]({ css: /*override*/ ctx[3] }));

    			if (dirty & /*$$scope, sections, classes, tween, $progress, theme, shade, segments, value, ariaLabel, $$slots, label*/ 67295216) {
    				box_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_element && dirty & /*element*/ 1) {
    				updating_element = true;
    				box_changes.element = /*element*/ ctx[0];
    				add_flush_callback(() => updating_element = false);
    			}

    			box.$set(box_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(box.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(box.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(box, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let segments;
    	let cx;
    	let classes;
    	let getStyles;
    	let theme;
    	let $progress;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Progress', slots, ['label']);
    	const $$slots = compute_slots(slots);
    	let { use = [], element = undefined, class: className = '', override = {}, value = undefined, color = undefined, size = 'md', radius = 'sm', striped = false, animate = false, label = '', sections = undefined, shade = 6, ariaLabel = randomID(), tween = false, tweenOptions = {} } = $$props;

    	const defaultTweenOptions = {
    		delay: 0,
    		duration: 400,
    		easing: cubicOut
    	};

    	const progress = tweened(undefined, { ...defaultTweenOptions, ...tweenOptions });
    	validate_store(progress, 'progress');
    	component_subscribe($$self, progress, value => $$invalidate(15, $progress = value));

    	const writable_props = [
    		'use',
    		'element',
    		'class',
    		'override',
    		'value',
    		'color',
    		'size',
    		'radius',
    		'striped',
    		'animate',
    		'label',
    		'sections',
    		'shade',
    		'ariaLabel',
    		'tween',
    		'tweenOptions'
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Progress> was created with unknown prop '${key}'`);
    	});

    	function box_element_binding(value) {
    		element = value;
    		$$invalidate(0, element);
    	}

    	$$self.$$set = $$props => {
    		if ('use' in $$props) $$invalidate(1, use = $$props.use);
    		if ('element' in $$props) $$invalidate(0, element = $$props.element);
    		if ('class' in $$props) $$invalidate(2, className = $$props.class);
    		if ('override' in $$props) $$invalidate(3, override = $$props.override);
    		if ('value' in $$props) $$invalidate(4, value = $$props.value);
    		if ('color' in $$props) $$invalidate(18, color = $$props.color);
    		if ('size' in $$props) $$invalidate(19, size = $$props.size);
    		if ('radius' in $$props) $$invalidate(20, radius = $$props.radius);
    		if ('striped' in $$props) $$invalidate(21, striped = $$props.striped);
    		if ('animate' in $$props) $$invalidate(22, animate = $$props.animate);
    		if ('label' in $$props) $$invalidate(5, label = $$props.label);
    		if ('sections' in $$props) $$invalidate(6, sections = $$props.sections);
    		if ('shade' in $$props) $$invalidate(7, shade = $$props.shade);
    		if ('ariaLabel' in $$props) $$invalidate(8, ariaLabel = $$props.ariaLabel);
    		if ('tween' in $$props) $$invalidate(9, tween = $$props.tween);
    		if ('tweenOptions' in $$props) $$invalidate(23, tweenOptions = $$props.tweenOptions);
    		if ('$$scope' in $$props) $$invalidate(26, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		useStyles,
    		getCumulativeSections,
    		tweened,
    		Box: Box$1,
    		Text: Text$1,
    		randomID,
    		cubicOut,
    		use,
    		element,
    		className,
    		override,
    		value,
    		color,
    		size,
    		radius,
    		striped,
    		animate,
    		label,
    		sections,
    		shade,
    		ariaLabel,
    		tween,
    		tweenOptions,
    		defaultTweenOptions,
    		progress,
    		theme,
    		getStyles,
    		classes,
    		cx,
    		segments,
    		$progress
    	});

    	$$self.$inject_state = $$props => {
    		if ('use' in $$props) $$invalidate(1, use = $$props.use);
    		if ('element' in $$props) $$invalidate(0, element = $$props.element);
    		if ('className' in $$props) $$invalidate(2, className = $$props.className);
    		if ('override' in $$props) $$invalidate(3, override = $$props.override);
    		if ('value' in $$props) $$invalidate(4, value = $$props.value);
    		if ('color' in $$props) $$invalidate(18, color = $$props.color);
    		if ('size' in $$props) $$invalidate(19, size = $$props.size);
    		if ('radius' in $$props) $$invalidate(20, radius = $$props.radius);
    		if ('striped' in $$props) $$invalidate(21, striped = $$props.striped);
    		if ('animate' in $$props) $$invalidate(22, animate = $$props.animate);
    		if ('label' in $$props) $$invalidate(5, label = $$props.label);
    		if ('sections' in $$props) $$invalidate(6, sections = $$props.sections);
    		if ('shade' in $$props) $$invalidate(7, shade = $$props.shade);
    		if ('ariaLabel' in $$props) $$invalidate(8, ariaLabel = $$props.ariaLabel);
    		if ('tween' in $$props) $$invalidate(9, tween = $$props.tween);
    		if ('tweenOptions' in $$props) $$invalidate(23, tweenOptions = $$props.tweenOptions);
    		if ('theme' in $$props) $$invalidate(10, theme = $$props.theme);
    		if ('getStyles' in $$props) $$invalidate(11, getStyles = $$props.getStyles);
    		if ('classes' in $$props) $$invalidate(12, classes = $$props.classes);
    		if ('cx' in $$props) $$invalidate(13, cx = $$props.cx);
    		if ('segments' in $$props) $$invalidate(14, segments = $$props.segments);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*sections*/ 64) {
    			$$invalidate(14, segments = Array.isArray(sections));
    		}

    		if ($$self.$$.dirty & /*value*/ 16) {
    			progress.set(value);
    		}

    		if ($$self.$$.dirty & /*animate, color, radius, size, shade, striped*/ 8126592) {
    			$$invalidate(
    				13,
    				{ cx, classes, getStyles, theme } = useStyles(
    					{
    						animate,
    						color,
    						radius,
    						size,
    						shade,
    						striped: striped || animate
    					},
    					{ name: 'Progress' }
    				),
    				cx,
    				(((((($$invalidate(12, classes), $$invalidate(22, animate)), $$invalidate(18, color)), $$invalidate(20, radius)), $$invalidate(19, size)), $$invalidate(7, shade)), $$invalidate(21, striped)),
    				(((((($$invalidate(11, getStyles), $$invalidate(22, animate)), $$invalidate(18, color)), $$invalidate(20, radius)), $$invalidate(19, size)), $$invalidate(7, shade)), $$invalidate(21, striped)),
    				(((((($$invalidate(10, theme), $$invalidate(22, animate)), $$invalidate(18, color)), $$invalidate(20, radius)), $$invalidate(19, size)), $$invalidate(7, shade)), $$invalidate(21, striped))
    			);
    		}
    	};

    	return [
    		element,
    		use,
    		className,
    		override,
    		value,
    		label,
    		sections,
    		shade,
    		ariaLabel,
    		tween,
    		theme,
    		getStyles,
    		classes,
    		cx,
    		segments,
    		$progress,
    		progress,
    		$$slots,
    		color,
    		size,
    		radius,
    		striped,
    		animate,
    		tweenOptions,
    		slots,
    		box_element_binding,
    		$$scope
    	];
    }

    class Progress extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {
    			use: 1,
    			element: 0,
    			class: 2,
    			override: 3,
    			value: 4,
    			color: 18,
    			size: 19,
    			radius: 20,
    			striped: 21,
    			animate: 22,
    			label: 5,
    			sections: 6,
    			shade: 7,
    			ariaLabel: 8,
    			tween: 9,
    			tweenOptions: 23
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Progress",
    			options,
    			id: create_fragment$3.name
    		});
    	}

    	get use() {
    		throw new Error("<Progress>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set use(value) {
    		throw new Error("<Progress>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get element() {
    		throw new Error("<Progress>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set element(value) {
    		throw new Error("<Progress>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get class() {
    		throw new Error("<Progress>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Progress>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get override() {
    		throw new Error("<Progress>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set override(value) {
    		throw new Error("<Progress>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<Progress>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<Progress>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get color() {
    		throw new Error("<Progress>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<Progress>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get size() {
    		throw new Error("<Progress>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set size(value) {
    		throw new Error("<Progress>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get radius() {
    		throw new Error("<Progress>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set radius(value) {
    		throw new Error("<Progress>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get striped() {
    		throw new Error("<Progress>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set striped(value) {
    		throw new Error("<Progress>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get animate() {
    		throw new Error("<Progress>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set animate(value) {
    		throw new Error("<Progress>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get label() {
    		throw new Error("<Progress>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set label(value) {
    		throw new Error("<Progress>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get sections() {
    		throw new Error("<Progress>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set sections(value) {
    		throw new Error("<Progress>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get shade() {
    		throw new Error("<Progress>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set shade(value) {
    		throw new Error("<Progress>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get ariaLabel() {
    		throw new Error("<Progress>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set ariaLabel(value) {
    		throw new Error("<Progress>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get tween() {
    		throw new Error("<Progress>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tween(value) {
    		throw new Error("<Progress>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get tweenOptions() {
    		throw new Error("<Progress>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tweenOptions(value) {
    		throw new Error("<Progress>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var Progress$1 = Progress;

    /* src/Quiz.svelte generated by Svelte v3.59.1 */
    const file$2 = "src/Quiz.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[11] = list[i];
    	child_ctx[13] = i;
    	return child_ctx;
    }

    // (1:0) <script>     import { fade, blur, fly, slide, scale }
    function create_catch_block(ctx) {
    	const block = {
    		c: noop,
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_catch_block.name,
    		type: "catch",
    		source: "(1:0) <script>     import { fade, blur, fly, slide, scale }",
    		ctx
    	});

    	return block;
    }

    // (75:12) {:then data}
    function create_then_block(ctx) {
    	let t;
    	let if_block_anchor;
    	let current;
    	let each_value = /*data*/ ctx[10].results;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	let if_block = /*activeQuestion*/ ctx[0] === /*numberOfQuestions*/ ctx[4] && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(target, anchor);
    				}
    			}

    			insert_dev(target, t, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*nextQuestion, quiz, questionNumber, activeQuestion*/ 39) {
    				each_value = /*data*/ ctx[10].results;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(t.parentNode, t);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			if (/*activeQuestion*/ ctx[0] === /*numberOfQuestions*/ ctx[4]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*activeQuestion*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$2(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(t);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_then_block.name,
    		type: "then",
    		source: "(75:12) {:then data}",
    		ctx
    	});

    	return block;
    }

    // (80:16) {#if index === activeQuestion}
    function create_if_block_1$1(ctx) {
    	let card;
    	let current;

    	card = new Card({
    			props: {
    				$$slots: { default: [create_default_slot_2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(card.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(card, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const card_changes = {};

    			if (dirty & /*$$scope, quiz, questionNumber*/ 16390) {
    				card_changes.$$scope = { dirty, ctx };
    			}

    			card.$set(card_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(card.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(card.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(card, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(80:16) {#if index === activeQuestion}",
    		ctx
    	});

    	return block;
    }

    // (82:20) <Card>
    function create_default_slot_2(ctx) {
    	let progress;
    	let t0;
    	let div;
    	let h4;
    	let t1;
    	let t2;
    	let t3;
    	let question;
    	let div_intro;
    	let current;

    	progress = new Progress$1({
    			props: {
    				value: /*questionNumber*/ ctx[2] * 10,
    				color: '#80FF72'
    			},
    			$$inline: true
    		});

    	question = new Question({
    			props: {
    				nextQuestion: /*nextQuestion*/ ctx[5],
    				question: /*question*/ ctx[11]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(progress.$$.fragment);
    			t0 = space();
    			div = element("div");
    			h4 = element("h4");
    			t1 = text("Question #");
    			t2 = text(/*questionNumber*/ ctx[2]);
    			t3 = space();
    			create_component(question.$$.fragment);
    			add_location(h4, file$2, 85, 28, 1847);
    			add_location(div, file$2, 84, 24, 1766);
    		},
    		m: function mount(target, anchor) {
    			mount_component(progress, target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div, anchor);
    			append_dev(div, h4);
    			append_dev(h4, t1);
    			append_dev(h4, t2);
    			append_dev(div, t3);
    			mount_component(question, div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const progress_changes = {};
    			if (dirty & /*questionNumber*/ 4) progress_changes.value = /*questionNumber*/ ctx[2] * 10;
    			progress.$set(progress_changes);
    			if (!current || dirty & /*questionNumber*/ 4) set_data_dev(t2, /*questionNumber*/ ctx[2]);
    			const question_changes = {};
    			if (dirty & /*quiz*/ 2) question_changes.question = /*question*/ ctx[11];
    			question.$set(question_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(progress.$$.fragment, local);
    			transition_in(question.$$.fragment, local);

    			if (!div_intro) {
    				add_render_callback(() => {
    					div_intro = create_in_transition(div, fade, { y: 200, duration: 300, delay: 300 });
    					div_intro.start();
    				});
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(progress.$$.fragment, local);
    			transition_out(question.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(progress, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div);
    			destroy_component(question);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2.name,
    		type: "slot",
    		source: "(82:20) <Card>",
    		ctx
    	});

    	return block;
    }

    // (78:12) {#each data.results as question, index }
    function create_each_block(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*index*/ ctx[13] === /*activeQuestion*/ ctx[0] && create_if_block_1$1(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*index*/ ctx[13] === /*activeQuestion*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*activeQuestion*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_1$1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(78:12) {#each data.results as question, index }",
    		ctx
    	});

    	return block;
    }

    // (95:16) {#if activeQuestion === numberOfQuestions}
    function create_if_block$2(ctx) {
    	let card;
    	let current;

    	card = new Card({
    			props: {
    				$$slots: { default: [create_default_slot_1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(card.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(card, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const card_changes = {};

    			if (dirty & /*$$scope, $score*/ 16392) {
    				card_changes.$$scope = { dirty, ctx };
    			}

    			card.$set(card_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(card.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(card.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(card, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(95:16) {#if activeQuestion === numberOfQuestions}",
    		ctx
    	});

    	return block;
    }

    // (97:16) <Card>
    function create_default_slot_1(ctx) {
    	let div;
    	let h3;
    	let t1;
    	let h2;
    	let t2;
    	let t3;
    	let t4;
    	let t5;
    	let t6;
    	let t7;
    	let h4;

    	const block = {
    		c: function create() {
    			div = element("div");
    			h3 = element("h3");
    			h3.textContent = "Game over.";
    			t1 = space();
    			h2 = element("h2");
    			t2 = text("Congratulations! You scored ");
    			t3 = text(/*$score*/ ctx[3]);
    			t4 = text(" out of ");
    			t5 = text(/*numberOfQuestions*/ ctx[4]);
    			t6 = text(" points.");
    			t7 = space();
    			h4 = element("h4");
    			h4.textContent = "Click the 'Start Quiz' button to play again!";
    			add_location(h3, file$2, 98, 24, 2187);
    			add_location(h2, file$2, 99, 24, 2231);
    			add_location(h4, file$2, 101, 24, 2366);
    			add_location(div, file$2, 97, 20, 2157);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h3);
    			append_dev(div, t1);
    			append_dev(div, h2);
    			append_dev(h2, t2);
    			append_dev(h2, t3);
    			append_dev(h2, t4);
    			append_dev(h2, t5);
    			append_dev(h2, t6);
    			append_dev(div, t7);
    			append_dev(div, h4);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$score*/ 8) set_data_dev(t3, /*$score*/ ctx[3]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(97:16) <Card>",
    		ctx
    	});

    	return block;
    }

    // (72:25)                  <!-- promise is pending -->                              {:then data}
    function create_pending_block(ctx) {
    	const block = {
    		c: noop,
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_pending_block.name,
    		type: "pending",
    		source: "(72:25)                  <!-- promise is pending -->                              {:then data}",
    		ctx
    	});

    	return block;
    }

    // (63:4) <CardLg>
    function create_default_slot$1(ctx) {
    	let div1;
    	let div0;
    	let promise;
    	let current;

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		hasCatch: false,
    		pending: create_pending_block,
    		then: create_then_block,
    		catch: create_catch_block,
    		value: 10,
    		blocks: [,,,]
    	};

    	handle_promise(promise = /*quiz*/ ctx[1], info);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			info.block.c();
    			attr_dev(div0, "class", "container");
    			add_location(div0, file$2, 70, 12, 1339);
    			attr_dev(div1, "class", "quiz svelte-1m11f7o");
    			add_location(div1, file$2, 66, 8, 1235);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			info.block.m(div0, info.anchor = null);
    			info.mount = () => div0;
    			info.anchor = null;
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			info.ctx = ctx;

    			if (dirty & /*quiz*/ 2 && promise !== (promise = /*quiz*/ ctx[1]) && handle_promise(promise, info)) ; else {
    				update_await_block_branch(info, ctx, dirty);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(info.block);
    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < 3; i += 1) {
    				const block = info.blocks[i];
    				transition_out(block);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			info.block.d();
    			info.token = null;
    			info = null;
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$1.name,
    		type: "slot",
    		source: "(63:4) <CardLg>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let main;
    	let header;
    	let t;
    	let cardlg;
    	let main_intro;
    	let main_outro;
    	let current;

    	header = new Header({
    			props: { resetQuiz: /*resetQuiz*/ ctx[6] },
    			$$inline: true
    		});

    	cardlg = new CardLg({
    			props: {
    				$$slots: { default: [create_default_slot$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			main = element("main");
    			create_component(header.$$.fragment);
    			t = space();
    			create_component(cardlg.$$.fragment);
    			add_location(main, file$2, 57, 0, 1128);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			mount_component(header, main, null);
    			append_dev(main, t);
    			mount_component(cardlg, main, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const cardlg_changes = {};

    			if (dirty & /*$$scope, quiz, $score, activeQuestion, questionNumber*/ 16399) {
    				cardlg_changes.$$scope = { dirty, ctx };
    			}

    			cardlg.$set(cardlg_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(header.$$.fragment, local);
    			transition_in(cardlg.$$.fragment, local);

    			add_render_callback(() => {
    				if (!current) return;
    				if (main_outro) main_outro.end(1);
    				main_intro = create_in_transition(main, fade, { delay: 500 });
    				main_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(header.$$.fragment, local);
    			transition_out(cardlg.$$.fragment, local);
    			if (main_intro) main_intro.invalidate();
    			main_outro = create_out_transition(main, fade, {});
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(header);
    			destroy_component(cardlg);
    			if (detaching && main_outro) main_outro.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let questionNumber;
    	let $score;
    	validate_store(score, 'score');
    	component_subscribe($$self, score, $$value => $$invalidate(3, $score = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Quiz', slots, []);
    	let activeQuestion = 0;
    	let quiz = getQuiz();
    	let isModalOpen = false;
    	let numberOfQuestions = 10;

    	async function getQuiz() {
    		const res = await fetch(`https://opentdb.com/api.php?amount=${numberOfQuestions}&category=9&type=multiple`);
    		const quiz = await res.json();
    		return quiz;
    	}

    	function nextQuestion() {
    		$$invalidate(0, activeQuestion = activeQuestion + 1);
    	}

    	function resetQuiz() {
    		isModalOpen = false;
    		score.set(0);
    		$$invalidate(1, quiz = getQuiz());
    		$$invalidate(0, activeQuestion = 0);
    	}

    	function addToScore() {
    		set_store_value(score, $score = score + 1, $score);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Quiz> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		fade,
    		blur,
    		fly,
    		slide,
    		scale,
    		onMount,
    		beforeUpdate,
    		afterUpdate,
    		onDestroy,
    		Question,
    		score,
    		Header,
    		Card,
    		CardLg,
    		Progress: Progress$1,
    		activeQuestion,
    		quiz,
    		isModalOpen,
    		numberOfQuestions,
    		getQuiz,
    		nextQuestion,
    		resetQuiz,
    		addToScore,
    		questionNumber,
    		$score
    	});

    	$$self.$inject_state = $$props => {
    		if ('activeQuestion' in $$props) $$invalidate(0, activeQuestion = $$props.activeQuestion);
    		if ('quiz' in $$props) $$invalidate(1, quiz = $$props.quiz);
    		if ('isModalOpen' in $$props) isModalOpen = $$props.isModalOpen;
    		if ('numberOfQuestions' in $$props) $$invalidate(4, numberOfQuestions = $$props.numberOfQuestions);
    		if ('questionNumber' in $$props) $$invalidate(2, questionNumber = $$props.questionNumber);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*activeQuestion*/ 1) {
    			//   $: if ($score > 7) {
    			//     isModalOpen = true;
    			//   }
    			$$invalidate(2, questionNumber = activeQuestion + 1);
    		}
    	};

    	return [
    		activeQuestion,
    		quiz,
    		questionNumber,
    		$score,
    		numberOfQuestions,
    		nextQuestion,
    		resetQuiz
    	];
    }

    class Quiz extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Quiz",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    function flip(node, { from, to }, params = {}) {
        const style = getComputedStyle(node);
        const transform = style.transform === 'none' ? '' : style.transform;
        const [ox, oy] = style.transformOrigin.split(' ').map(parseFloat);
        const dx = (from.left + from.width * ox / to.width) - (to.left + ox);
        const dy = (from.top + from.height * oy / to.height) - (to.top + oy);
        const { delay = 0, duration = (d) => Math.sqrt(d) * 120, easing = cubicOut } = params;
        return {
            delay,
            duration: is_function(duration) ? duration(Math.sqrt(dx * dx + dy * dy)) : duration,
            easing,
            css: (t, u) => {
                const x = u * dx;
                const y = u * dy;
                const sx = t + u * from.width / to.width;
                const sy = t + u * from.height / to.height;
                return `transform: ${transform} translate(${x}px, ${y}px) scale(${sx}, ${sy});`;
            }
        };
    }

    /* src/QuizStart.svelte generated by Svelte v3.59.1 */
    const file$1 = "src/QuizStart.svelte";

    // (15:2) {#if animate}
    function create_if_block$1(ctx) {
    	let div;
    	let h2;
    	let t1;
    	let button;
    	let div_intro;
    	let div_outro;
    	let current;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			h2 = element("h2");
    			h2.textContent = "🎉 Welcome to 'Trivia Time'! 🎉";
    			t1 = space();
    			button = element("button");
    			button.textContent = "START";
    			attr_dev(h2, "class", "svelte-6tdisc");
    			add_location(h2, file$1, 16, 6, 312);
    			attr_dev(button, "class", "btn svelte-6tdisc");
    			add_location(button, file$1, 17, 6, 359);
    			attr_dev(div, "class", "start-div svelte-6tdisc");
    			add_location(div, file$1, 15, 4, 247);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h2);
    			append_dev(div, t1);
    			append_dev(div, button);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(
    					button,
    					"click",
    					function () {
    						if (is_function(/*startQuiz*/ ctx[0])) /*startQuiz*/ ctx[0].apply(this, arguments);
    					},
    					false,
    					false,
    					false,
    					false
    				);

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!current) return;
    				if (div_outro) div_outro.end(1);
    				div_intro = create_in_transition(div, fade, { delay: 500 });
    				div_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (div_intro) div_intro.invalidate();
    			div_outro = create_out_transition(div, scale, {});
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching && div_outro) div_outro.end();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(15:2) {#if animate}",
    		ctx
    	});

    	return block;
    }

    // (13:0) <CardLg>
    function create_default_slot(ctx) {
    	let main;
    	let current;
    	let if_block = /*animate*/ ctx[1] && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			main = element("main");
    			if (if_block) if_block.c();
    			add_location(main, file$1, 13, 2, 220);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			if (if_block) if_block.m(main, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*animate*/ ctx[1]) if_block.p(ctx, dirty);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(13:0) <CardLg>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let cardlg;
    	let current;

    	cardlg = new CardLg({
    			props: {
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(cardlg.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(cardlg, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const cardlg_changes = {};

    			if (dirty & /*$$scope, startQuiz*/ 5) {
    				cardlg_changes.$$scope = { dirty, ctx };
    			}

    			cardlg.$set(cardlg_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(cardlg.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(cardlg.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(cardlg, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('QuizStart', slots, []);
    	let { startQuiz } = $$props;
    	let animate = true;

    	$$self.$$.on_mount.push(function () {
    		if (startQuiz === undefined && !('startQuiz' in $$props || $$self.$$.bound[$$self.$$.props['startQuiz']])) {
    			console.warn("<QuizStart> was created without expected prop 'startQuiz'");
    		}
    	});

    	const writable_props = ['startQuiz'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<QuizStart> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('startQuiz' in $$props) $$invalidate(0, startQuiz = $$props.startQuiz);
    	};

    	$$self.$capture_state = () => ({
    		startQuiz,
    		CardLg,
    		fade,
    		blur,
    		fly,
    		slide,
    		scale,
    		flip,
    		animate
    	});

    	$$self.$inject_state = $$props => {
    		if ('startQuiz' in $$props) $$invalidate(0, startQuiz = $$props.startQuiz);
    		if ('animate' in $$props) $$invalidate(1, animate = $$props.animate);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [startQuiz, animate];
    }

    class QuizStart extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { startQuiz: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "QuizStart",
    			options,
    			id: create_fragment$1.name
    		});
    	}

    	get startQuiz() {
    		throw new Error("<QuizStart>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set startQuiz(value) {
    		throw new Error("<QuizStart>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/App.svelte generated by Svelte v3.59.1 */
    const file = "src/App.svelte";

    // (19:33) 
    function create_if_block_1(ctx) {
    	let quiz;
    	let current;
    	quiz = new Quiz({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(quiz.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(quiz, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(quiz.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(quiz.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(quiz, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(19:33) ",
    		ctx
    	});

    	return block;
    }

    // (15:2) {#if isQuizStart === false}
    function create_if_block(ctx) {
    	let quizstart;
    	let current;

    	quizstart = new QuizStart({
    			props: { startQuiz: /*startQuiz*/ ctx[1] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(quizstart.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(quizstart, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(quizstart.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(quizstart.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(quizstart, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(15:2) {#if isQuizStart === false}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let div;
    	let current_block_type_index;
    	let if_block;
    	let current;
    	const if_block_creators = [create_if_block, create_if_block_1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*isQuizStart*/ ctx[0] === false) return 0;
    		if (/*isQuizStart*/ ctx[0] === true) return 1;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type(ctx))) {
    		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (if_block) if_block.c();
    			attr_dev(div, "class", "app svelte-tuxhhn");
    			add_location(div, file, 12, 0, 224);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if (~current_block_type_index) {
    					if_blocks[current_block_type_index].p(ctx, dirty);
    				}
    			} else {
    				if (if_block) {
    					group_outros();

    					transition_out(if_blocks[previous_block_index], 1, 1, () => {
    						if_blocks[previous_block_index] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index) {
    					if_block = if_blocks[current_block_type_index];

    					if (!if_block) {
    						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    						if_block.c();
    					} else {
    						if_block.p(ctx, dirty);
    					}

    					transition_in(if_block, 1);
    					if_block.m(div, null);
    				} else {
    					if_block = null;
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d();
    			}
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	let isQuizStart = false;

    	let startQuiz = () => {
    		$$invalidate(0, isQuizStart = true);
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Quiz,
    		Header,
    		QuizStart,
    		isQuizStart,
    		startQuiz
    	});

    	$$self.$inject_state = $$props => {
    		if ('isQuizStart' in $$props) $$invalidate(0, isQuizStart = $$props.isQuizStart);
    		if ('startQuiz' in $$props) $$invalidate(1, startQuiz = $$props.startQuiz);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [isQuizStart, startQuiz];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    	}
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
