#if DEBUG
import Foundation
import WebKit

/// DEV-only proxy that logs WKWebView navigation and errors then forwards to the original delegate.
final class WKNavigationDelegateProxy: NSObject, WKNavigationDelegate {

    weak var next: WKNavigationDelegate?
    private(set) var lastURL: String?

    init(next: WKNavigationDelegate?) {
        self.next = next
        super.init()
    }

    private func logError(_ label: String, _ error: Error, failingURL: String?) {
        let ns = error as NSError
        let domain = ns.domain
        let code = ns.code
        let desc = ns.localizedDescription
        let failingFromInfo = (ns.userInfo[NSURLErrorFailingURLStringErrorKey] as? String) ?? ""
        let underlying = (ns.userInfo[NSUnderlyingErrorKey] as? NSError)?.localizedDescription ?? ""
        print("[wkdiag] \(label) domain=\(domain) code=\(code) description=\(desc)")
        if !failingFromInfo.isEmpty { print("[wkdiag] \(label) failingURL(from userInfo)=\(failingFromInfo)") }
        if let u = failingURL, !u.isEmpty { print("[wkdiag] \(label) lastURL=\(u)") }
        if !underlying.isEmpty { print("[wkdiag] \(label) underlying=\(underlying)") }
    }

    // MARK: - WKNavigationDelegate (forward + log)

    func webView(_ webView: WKWebView, decidePolicyFor navigationAction: WKNavigationAction, decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
        if let url = navigationAction.request.url?.absoluteString {
            lastURL = url
            print("[wkdiag] NAV start \(url)")
        }
        let sel = NSSelectorFromString("webView:decidePolicyForNavigationAction:decisionHandler:")
        if let n = next, (n as AnyObject).responds(to: sel) {
            n.webView?(webView, decidePolicyFor: navigationAction, decisionHandler: decisionHandler)
        } else {
            decisionHandler(.allow)
        }
    }

    func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) {
        let failingURL = (error as NSError).userInfo[NSURLErrorFailingURLStringErrorKey] as? String
        logError("FAIL provisional", error, failingURL: failingURL ?? lastURL)
        next?.webView?(webView, didFailProvisionalNavigation: navigation, withError: error)
    }

    func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
        let failingURL = (error as NSError).userInfo[NSURLErrorFailingURLStringErrorKey] as? String
        logError("FAIL nav", error, failingURL: failingURL ?? lastURL)
        next?.webView?(webView, didFail: navigation, withError: error)
    }

    func webViewWebContentProcessDidTerminate(_ webView: WKWebView) {
        print("[wkdiag] TERMINATED lastURL=\(lastURL ?? "nil")")
        next?.webViewWebContentProcessDidTerminate?(webView)
    }
}
#endif
