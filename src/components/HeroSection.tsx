export default function HeroSection() {
  return (
    <section className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold sm:text-5xl sm:tracking-tight lg:text-6xl">
            智能面试问题生成器
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-blue-100">
            上传简历和职位描述，基于阿里云DashScope Qwen2.5模型自动生成个性化面试问题，助您轻松准备面试
          </p>
        </div>
      </div>
    </section>
  );
}