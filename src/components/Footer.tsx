export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">面试问题生成器</h3>
            <p className="text-gray-400">帮助求职者高效准备面试，提高面试成功率</p>
          </div>
          <div>
            <h4 className="text-md font-semibold mb-4">产品</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white">功能介绍</a></li>
              <li><a href="#" className="hover:text-white">定价计划</a></li>
              <li><a href="#" className="hover:text-white">API接口</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-md font-semibold mb-4">资源</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white">帮助中心</a></li>
              <li><a href="#" className="hover:text-white">使用指南</a></li>
              <li><a href="#" className="hover:text-white">博客</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-md font-semibold mb-4">公司</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white">关于我们</a></li>
              <li><a href="#" className="hover:text-white">联系我们</a></li>
              <li><a href="#" className="hover:text-white">隐私政策</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-700 text-center text-gray-400">
          <p>&copy; 2023 面试问题生成器. 保留所有权利.</p>
        </div>
      </div>
    </footer>
  );
}