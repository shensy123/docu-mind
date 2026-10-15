import type { RouteLocationNormalizedLoadedGeneric, RouteRecordRaw } from 'vue-router'

export function filterHiddenRoutes(routes: RouteRecordRaw[]) {
  return routes.filter(route => {
    if (route.meta?.hidden) return false
    if (route.children?.length) route.children = filterHiddenRoutes(route.children)
    return true
  })
}

export function getDefaultOpenedMenus(routes: RouteRecordRaw[]) {
  return routes.filter(route => route.meta?.opened).map(route => route.path)
}

/**
 * vben 风格 根据当前路由匹配面包屑路径
 * @param {Object} route 当前$route
 * @returns 面包屑数组 [{ path, title }]
 */
export function getBreadcrumbList(route: RouteLocationNormalizedLoadedGeneric) {
  const matched = route.matched
  console.log('matched', matched)
  return matched.map(item => ({
    path: item.path,
    title: item.meta?.title || '',
  }))
}
