export default function FeaturesSection() {
  const features = [
    {
      title: "智能生成",
      description: "基于阿里云DashScope Qwen2.5大模型，根据您的简历和职位要求精准生成个性化面试问题",
      icon: "fas fa-bolt",
      color: "text-blue-500"
    },
    {
      title: "节省时间",
      description: "几分钟内生成全面的面试问题，无需花费数小时准备",
      icon: "fas fa-clock",
      color: "text-green-500"
    },
    {
      title: "专业准确",
      description: "问题由HR专家和行业资深人士共同审核，确保质量",
      icon: "fas fa-graduation-cap",
      color: "text-yellow-500"
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">为什么选择我们的面试问题生成器？</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {features.map((feature, index) => (
          <div key={index} className="bg-white p-6 rounded-xl shadow-md text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className={`${feature.icon} ${feature.color} text-2xl`}></i>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">{feature.title}</h3>
            <p className="text-gray-600">{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}