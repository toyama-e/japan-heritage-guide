export const metadata = {
  title: 'My App',
  description: 'Next.js Docker Test',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ja">
      <body>
        {children}
      </body>
    </html>
  );
}
