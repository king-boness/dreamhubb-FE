import UIKit
import Capacitor

class SceneDelegate: UIResponder, UIWindowSceneDelegate {

    var window: UIWindow?

    func scene(_ scene: UIScene, willConnectTo session: UISceneSession, options connectionOptions: UIScene.ConnectionOptions) {
        // UISceneStoryboardFile=Main provides window from Main.storyboard; in DEBUG swap root to DiagnosticBridgeViewController.
        guard let windowScene = (scene as? UIWindowScene) else { return }
        #if DEBUG
        let win = UIWindow(windowScene: windowScene)
        win.rootViewController = DiagnosticBridgeViewController()
        win.makeKeyAndVisible()
        window = win
        #endif
        // Capacitor: forward launch URL / Universal Link when app started via deep link
        for ctx in connectionOptions.urlContexts {
            var opts: [UIApplication.OpenURLOptionsKey: Any] = [.openInPlace: ctx.options.openInPlace]
            if let app = ctx.options.sourceApplication { opts[.sourceApplication] = app }
            if let ann = ctx.options.annotation { opts[.annotation] = ann }
            _ = ApplicationDelegateProxy.shared.application(UIApplication.shared, open: ctx.url, options: opts)
        }
        for activity in connectionOptions.userActivities {
            _ = ApplicationDelegateProxy.shared.application(UIApplication.shared, continue: activity, restorationHandler: { _ in })
        }
    }

    func sceneDidDisconnect(_ scene: UIScene) {
    }

    func sceneDidBecomeActive(_ scene: UIScene) {
    }

    func sceneWillResignActive(_ scene: UIScene) {
    }

    func sceneWillEnterForeground(_ scene: UIScene) {
    }

    func sceneDidEnterBackground(_ scene: UIScene) {
    }

    // Capacitor: deep links / appUrlOpen
    func scene(_ scene: UIScene, openURLContexts URLContexts: Set<UIOpenURLContext>) {
        for context in URLContexts {
            var opts: [UIApplication.OpenURLOptionsKey: Any] = [.openInPlace: context.options.openInPlace]
            if let app = context.options.sourceApplication { opts[.sourceApplication] = app }
            if let ann = context.options.annotation { opts[.annotation] = ann }
            _ = ApplicationDelegateProxy.shared.application(UIApplication.shared, open: context.url, options: opts)
        }
    }

    // Capacitor: Universal Links / user activity
    func scene(_ scene: UIScene, continue userActivity: NSUserActivity, restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) {
        _ = ApplicationDelegateProxy.shared.application(
            UIApplication.shared,
            continue: userActivity,
            restorationHandler: restorationHandler
        )
    }
}
