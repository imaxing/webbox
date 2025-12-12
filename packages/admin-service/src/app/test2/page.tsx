export default function Test2Page() {
  return (
    <div style={{ padding: '50px', backgroundColor: 'red', color: 'white' }}>
      <h1 style={{ fontSize: '48px' }}>这是测试页面 - 如果你能看到这个红色背景，说明渲染正常</h1>
      <p style={{ fontSize: '24px' }}>当前时间: {new Date().toLocaleString()}</p>
    </div>
  );
}
