package com.nextorra.chatx.navigation

sealed class Screen(val route: String) {
    // Authentication Screens
    object Splash : Screen("splash")
    object Login : Screen("login")
    object Register : Screen("register")

    // Main App Screens
    object ChatList : Screen("chat_list")
    object ChatDetail : Screen("chat_detail/{chatId}") {
        fun createRoute(chatId: String) = "chat_detail/$chatId"
    }
    object Profile : Screen("profile")
    object Settings : Screen("settings")

    // Additional Screens
    object NewChat : Screen("new_chat")
    object UserSearch : Screen("user_search")
}

