function observe (data, vm) {
  if (!data || typeof data != 'object') {
    return
  }
  Object.keys(data).forEach(function (key) {
    defineReactive(vm, key, data[key])
  })
}

function defineReactive (data, key, val) {
  var dep = new Dep()
  observe(val, data)
  Object.defineProperty(data, key, {
    enumerable: true,
    configurable: false,
    get: function () {
      if (Dep.target) {
        Dep.target.addDep(dep)
      }
      return val
    },
    set: function (newVal) {
      if (newVal == val) {
        return
      }
      val = newVal
      dep.notify()
    }
  })
}
function Watcher (vm, expOrFn, cb) {
  this.vm = vm
  this.getter = expOrFn
  this.cb = cb
  this.depIds = []
  this.value = this.get()
}
Watcher.prototype.get = function () {
  Dep.target = this
  var value = this.getter.call(this.vm)
  Dep.target = null
  return value
}
Watcher.prototype.update = function () {
  var value = this.get()
  if (this.value !== value) {
    var oldValue = this.value
    this.value = value
    this.cb.call(this.vm, value, oldValue)
  }
}
Watcher.prototype.addDep = function (dep) {
  var id = dep.id
  // to avoid depending the watcher to the same dep more than once
  if (this.depIds.indexOf(id) === -1) {
    this.depIds.push(id)
    dep.addsub(this)
  }
}
var uid$1 = 0
function Dep () {
  this.id = uid$1++
  this.subs = []
}
Dep.prototype = {
  addsub: function (sub) {
    this.subs.push(sub)
  },
  notify: function () {
    this.subs.forEach(function (sub) {
      sub.update()
    })
  }
}

function vNode (tag, data, children, text, elm) {
  this.tag = tag
  this.data = data
  this.children = children
  this.text = text
  this.elm = elm
}

function createEle (vNode) {
  var tag = vNode.tag
  var data = vNode.data
  var children = vNode.children

  if (tag != undefined) {
    vNode.elm = document.createElement(tag)
    if (data.attrs != undefined) {
      for (var key in data.attrs) {
        vNode.elm.setAttribute(key, data.attrs[key])
      }
    }
    if (children) {
      createChild(vNode, children)
    }
  } else {
    vNode.elm = document.createTextNode(vNode.text)
  }
  return vNode.elm
}

function createChild (vNode, children) {
  for (var i = children.length - 1; i >= 0; i--) {
    vNode.elm.appendChild(createEle(children[i]))
  }
}

function normalizeChildren (children) {
  return typeof children == 'string' ? [new vNode(undefined, undefined, undefined, String(children))] : children
}

function createElement (tag, data, children) {
  return new vNode(tag, data, normalizeChildren(children), undefined)
}

function sameVnode (vnode1, vnode2) {
  return vnode1.tag === vnode2.tag
}

function emptyNode (elm) {
  return new vNode(elm.tagName.toLowerCase(), {}, [], undefined, elm)
}

function patchVnode (oldVnode, vNode) {
  var elm = vNode.elm = oldVnode.elm
  var oldCh = oldVnode.children
  var ch = vNode.children
  if (!vNode.text) {
    if (oldCh && ch) {
      updateCh(oldCh, ch)
    }
  } else {
    elm.textContent = vNode.text
  }
}

function updateCh (oldCh, ch) {
  if (sameVnode(oldCh[0], ch[0])) {
    patchVnode(oldCh[0], ch[0])
  } else {
    patch(oldCh[0], ch[0])
  }
}

function patch (oldVnode, vnode) {
  if (!oldVnode.nodeType && sameVnode(oldVnode, vnode)) {
    patchVnode(oldVnode, vnode)
  } else {
    if (oldVnode.nodeType) {
      oldVnode = emptyNode(oldVnode)
    }
    var elm = oldVnode.elm
    var parent = elm.parentNode
    createEle(vnode)
    parent.insertBefore(vnode.elm, elm)
    parent.removeChild(elm)
  }
  return vNode.elm
}

function initData (vm) {
  var data = vm.$data = vm.$options.data
  var keys = Object.keys(data)
  var i = keys.length
  while(i--) {
    proxy(vm, keys[i])
  }
  observe(data, vm)
}

function proxy (vm, key) {
  Object.defineProperty(vm, key, {
    configurable: true,
    enumerable: true,
    get: function () {
      return vm.$data[key]
    },
    set: function (newVal) {
      vm.$data[key] = newVal
    }
  })
}

function Vue (options) {
  this.$options = options
  initData(this)
  this.mount(document.getElementById(options.el))
}

Vue.prototype.mount = function(el) {
  this.$el = el
  var vm = this
  new Watcher(vm, function () {
    vm.update(vm.render())
  })
}

Vue.prototype.update = function(vnode) {
  var preVnode = this._vnode
  this._vnode = vnode
  if (!preVnode) {
    this.$el = this.patch(this.$el, vnode)
  } else {
    this.$el = this.patch(preVnode, vnode)
  }
}

Vue.prototype.patch = patch

Vue.prototype.render = function () {
  return this.$options.render.call(this)
}
