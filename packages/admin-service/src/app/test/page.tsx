export default function TestPage() {
  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold mb-4">测试页面</h1>
      <p className="text-lg">如果你能看到这个页面，说明 Next.js 和 Tailwind CSS 都在正常工作！</p>
      <div className="mt-4 p-4 bg-blue-500 text-white rounded">
        这是一个蓝色背景的div
      </div>
      <div className="mt-4 p-4 bg-primary text-primary-foreground rounded">
        这是使用主题色的div
      </div>
    </div>
  );
}
