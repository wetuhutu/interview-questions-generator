export default function Header() {
  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <i className="fas fa-graduation-cap text-blue-500 text-2xl mr-2"></i>
              <span className="text-xl font-bold text-gray-800">面试问题生成器</span>
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <a href="#" className="text-gray-600 hover:text-blue-500">首页</a>
            <a href="#" className="text-gray-600 hover:text-blue-500">使用说明</a>
            <a href="#" className="text-gray-600 hover:text-blue-500">联系我们</a>
          </div>
        </div>
      </div>
    </nav>
  );
}