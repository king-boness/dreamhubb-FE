#if DEBUG
import Capacitor
import UIKit
import WebKit

/// DEV-only bridge VC that installs a navigation delegate proxy to log WKWebView errors (e.g. DownloadFailed).
final class DiagnosticBridgeViewController: CAPBridgeViewController {

    private var navProxy: WKNavigationDelegateProxy?

    override func viewDidLoad() {
        super.viewDidLoad()
        guard let wv = webView else {
            print("[wkdiag] webView nil")
            return
        }
        let proxy = WKNavigationDelegateProxy(next: wv.navigationDelegate)
        navProxy = proxy
        wv.navigationDelegate = proxy
        print("[wkdiag] installed navigation delegate proxy")
    }
}
#endif
