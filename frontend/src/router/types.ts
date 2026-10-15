import type { Component } from 'vue'
import type { RouteLocationNormalized } from 'vue-router'

export interface RouteMeta {
  title?: string
  icon?: Component
  hidden?: boolean
  // 是否缓存
  keepAlive?: boolean
  // 是否忽略权限
  ignoreAuth?: boolean
  //
  isAuth?: boolean
}

export interface ToRouteType extends RouteLocationNormalized {
  meta: {
    title: string
    icon?: Component
    hidden?: boolean
    opened?: boolean
    roles?: string[]
    keepAlive?: boolean
    requireAuth?: boolean
    ignoreAuth?: boolean
  }
}
