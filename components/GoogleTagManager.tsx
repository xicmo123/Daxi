import Script from "next/script";

export default function GoogleTagManager() {
  return (
    <Script id="daxi-gtm-bootstrap" strategy="afterInteractive">
      {`
        (() => {
          window.dataLayer = window.dataLayer || [];
          window.gtag = function gtag() { window.dataLayer.push(arguments); };
          window.gtag('js', new Date());

          const script = document.createElement('script');
          script.id = 'daxi-gtm';
          script.src = 'https://www.googletagmanager.com/gtm.js?id=GTM-WSHNF4TN';
          script.async = true;
          document.head.appendChild(script);
        })();
      `}
    </Script>
  );
}
