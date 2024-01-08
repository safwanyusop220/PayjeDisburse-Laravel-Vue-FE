import { useAuthStore } from "@/stores/auth"
import { type RouteMetaAuth } from "@/types/auth.d"
import { type RouteLocationNormalized } from "vue-router"

export function authCheck(route: RouteLocationNormalized) {
	const meta: RouteMetaAuth = route.meta
	const { checkAuth, authRedirect, auth, roles, permission } = meta

	if (route?.redirectedFrom?.name === "Logout") {
		useAuthStore().setLogout()
	}

	if (auth === true) {
		if (!useAuthStore().isLogged) {
			window.location.href = "/" + window.location.search
			return false
		}

		if (roles && !useAuthStore().isRoleGranted(roles)) {
			window.location.href = "/dashboards" + window.location.search
			return false
		}

		if (permission && !useAuthStore().isAllowed(permission)) {
			window.location.href = "/dashboards" + window.location.search
			return false
		}
	}

	if (checkAuth === true) {
		if (useAuthStore().isLogged) {
			if (roles) {
				if (useAuthStore().isRoleGranted(roles)) {
					return authRedirect || "/"
				} else {
					return route.path
				}
			}

			return authRedirect || "/"
		}
	}
}
