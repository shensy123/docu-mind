import type { Directive } from 'vue'

type FocusHandlers = {
  onMouseEnter: (event: MouseEvent) => void
  onMouseLeave: (event: MouseEvent) => void
  onClick: (event: MouseEvent) => void
}

type ElementMaskData = {
  mask: HTMLDivElement
  handlers: FocusHandlers
  uniqueClass: string
  positionChanged: boolean
}

const maskData = new WeakMap<HTMLElement, ElementMaskData>()
let selectedElement: HTMLElement | null = null
let activeHoverElement: HTMLElement | null = null
let documentClickListenerAdded = false
let directiveBindCount = 0

// 悬停样式：虚线边框和轻微背景色
const hoverStyle = {
  className: 'view-focus-mask-hover',
  outline: '1px dashed rgba(0, 112, 255, 1)',
  backgroundColor: 'rgba(0, 112, 255, 0.05)',
}

// 选中样式：实线边框和更明显的背景色
const selectedStyle = {
  className: 'view-focus-mask-selected',
  outline: '1px solid rgba(0, 112, 255, 1)',
  backgroundColor: '',
}

// createMask 方法：创建遮罩 div，并设置默认隐藏与基础样式
function createMask(el: HTMLElement): HTMLDivElement {
  const mask = document.createElement('div')
  const uniqueClass = `view-focus-mask_${Math.random().toString(36).slice(2, 10)}`
  // 使用默认遮罩类名以及一个随机唯一类名，便于定位和调试
  mask.className = `view-focus-mask ${uniqueClass}`
  mask.style.position = 'absolute'
  mask.style.top = '0'
  mask.style.left = '0'
  mask.style.width = '100%'
  mask.style.height = '100%'
  mask.style.boxSizing = 'border-box'
  // 新增：继承父元素的box-sizing，避免padding/border干扰
  mask.style.boxSizing = el.style.boxSizing || window.getComputedStyle(el).boxSizing
  mask.style.pointerEvents = 'none'
  mask.style.display = 'none'
  return mask
}

// ensurePosition 方法：确保目标元素具有非 static 定位，以便遮罩绝对定位覆盖
function ensurePosition(el: HTMLElement): boolean {
  // 如果目标元素是 static，则改为 relative，保证遮罩按位置覆盖
  const computed = window.getComputedStyle(el)
  if (computed.position === 'static' || !computed.position) {
    el.style.position = 'relative'
    return true
  }
  return false
}

// showMask 方法：显示当前元素的遮罩，并根据是否选中设置边框样式
function showMask(el: HTMLElement, selected = false) {
  const data = maskData.get(el)
  if (!data) return
  const mask = data.mask
  mask.style.display = 'block'
  mask.style.outline = selected ? selectedStyle.outline : hoverStyle.outline
  mask.style.backgroundColor = selected ? selectedStyle.backgroundColor : hoverStyle.backgroundColor
  if (selected) {
    mask.classList.add(selectedStyle.className)
    mask.classList.remove(hoverStyle.className)
  } else {
    mask.classList.add(hoverStyle.className)
    mask.classList.remove(selectedStyle.className)
  }
}

// hideMask 方法：隐藏当前元素的遮罩
function hideMask(el: HTMLElement) {
  const data = maskData.get(el)
  if (!data) return
  data.mask.style.display = 'none'
  data.mask.classList.remove(hoverStyle.className, selectedStyle.className)
}

// updateSelectedElement 方法：切换选中元素，隐藏之前选中元素遮罩并显示新的选中遮罩
function updateSelectedElement(el: HTMLElement | null) {
  if (selectedElement === el) return

  if (selectedElement) {
    hideMask(selectedElement)
  }

  selectedElement = el
  if (selectedElement) {
    showMask(selectedElement, true)
  }
}

// findRegisteredAncestor 方法：沿 DOM 向上查找第一个已注册 focus 指令的父元素
function findRegisteredAncestor(node: Node | null): HTMLElement | null {
  while (node && node instanceof HTMLElement) {
    if (maskData.has(node)) {
      return node
    }
    node = node.parentNode
  }
  return null
}

// onDocumentClick 方法：监听文档点击，点击元素外部时取消当前选中遮罩
const onDocumentClick = (event: MouseEvent) => {
  if (!selectedElement) return
  const target = event.target
  if (target instanceof Node && !selectedElement.contains(target)) {
    // 点击元素外部时取消选中遮罩
    updateSelectedElement(null)
  }
}

// 新增全局清理逻辑（可封装为函数）
function cleanupDocumentListener() {
  if (directiveBindCount === 0 && documentClickListenerAdded) {
    document.removeEventListener('click', onDocumentClick)
    documentClickListenerAdded = false
  }
}

/**
 * 这是一个名为focus的自定义指令，用于处理元素的焦点、悬停和点击事件
 */
export const focus: Directive = {
  /**
   * 指令挂载时的回调函数
   * @param el - 指令绑定的DOM元素
   */
  mounted(el: HTMLElement) {
    // 创建遮罩元素
    const mask = createMask(el)
    // 确保元素位置正确
    const positionChanged = ensurePosition(el)
    // 将遮罩元素添加到目标元素中
    if (el.isConnected) {
      // 确保元素在DOM树中
      el.appendChild(mask)
    }

    // 如果全局点击监听器未添加且document对象存在，则添加点击监听
    if (!documentClickListenerAdded && typeof document !== 'undefined') {
      document.addEventListener('click', onDocumentClick)
      documentClickListenerAdded = true
    }
    directiveBindCount++ // 挂载时计数+1

    // 鼠标进入事件处理函数
    const onMouseEnter = (event: MouseEvent) => {
      // 操作的目标元素是选中元素以外的元素才允许添加遮罩，且事件触发目标为当前元素，防止冒泡导致错误遮罩显示（父元素）
      console.log('进入')
      console.log('event.target:', event.target)
      console.log('event.relatedTarget:', event.relatedTarget)
      console.log('el:', el.contains(event.relatedTarget as Node))
      console.log('el:', el)
      if (selectedElement !== el) {
        // 隐藏上一个激活元素（如果存在活动的悬停元素且不是当前元素，且此元素不是已选中元素，则隐藏其遮罩）
        if (
          activeHoverElement &&
          activeHoverElement !== el &&
          activeHoverElement !== selectedElement
        ) {
          hideMask(activeHoverElement)
        }
        // 显示当前元素的遮罩
        showMask(el)
        // 设置当前元素为活动悬停元素
        activeHoverElement = el
      } else if (activeHoverElement) {
        hideMask(activeHoverElement)
        activeHoverElement = null
      }
    }

    // 鼠标离开事件处理函数
    const onMouseLeave = (event: MouseEvent) => {
      console.log('离开')
      // 如果当前元素不是选中的元素
      if (selectedElement !== el) {
        // 隐藏当前元素的遮罩
        hideMask(el)
        // 如果当前元素是活动悬停元素，则清除活动状态
        if (activeHoverElement === el) {
          activeHoverElement = null
        }
      }
      // 获取事件相关目标元素
      const relatedTarget = event.relatedTarget as Node | null
      // 查找注册的祖先元素
      const ancestor = findRegisteredAncestor(relatedTarget)
      // 如果找到祖先元素且不是当前选中的元素，则显示其遮罩
      if (ancestor && ancestor !== selectedElement) {
        showMask(ancestor)
        activeHoverElement = ancestor
      }
    }

    // 点击事件处理函数
    const onClick = (event: MouseEvent) => {
      // 阻止事件冒泡
      event.stopPropagation()
      // 更新选中的元素
      updateSelectedElement(el)
    }

    // 为元素添加事件监听器
    el.addEventListener('mouseenter', onMouseEnter)
    el.addEventListener('mouseleave', onMouseLeave)
    el.addEventListener('click', onClick)

    // 将遮罩相关数据存储到Map中
    maskData.set(el, {
      mask,
      handlers: { onMouseEnter, onMouseLeave, onClick },
      uniqueClass: mask.classList.item(1) || '',
      positionChanged,
    })
  },

  /**
   * 指令卸载时的回调函数
   * @param el - 指令绑定的DOM元素
   */
  unmounted(el: HTMLElement) {
    // 从Map中获取元素的数据
    const data = maskData.get(el)
    if (!data) return

    // 解构数据
    const { handlers, mask, positionChanged } = data
    // 移除元素的事件监听器
    el.removeEventListener('mouseenter', handlers.onMouseEnter)
    el.removeEventListener('mouseleave', handlers.onMouseLeave)
    el.removeEventListener('click', handlers.onClick)
    // 如果遮罩是元素的子节点，则移除遮罩
    if (mask.parentNode === el && el.isConnected) {
      el.removeChild(mask)
    }
    // 如果元素位置被修改过，则恢复原始位置样式
    if (positionChanged) {
      el.style.position = ''
    }
    // 如果元素是当前选中的元素，则清除选中状态
    if (selectedElement === el) {
      selectedElement = null
    }
    // 如果元素是当前活动悬停元素，则清除活动状态
    if (activeHoverElement === el) {
      activeHoverElement = null
    }
    // 从Map中删除元素的数据
    maskData.delete(el)

    directiveBindCount-- // 卸载时计数-1
    cleanupDocumentListener() // 检查是否需要移除全局监听
  },
}
