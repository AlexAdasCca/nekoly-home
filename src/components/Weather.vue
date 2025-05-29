<template>
  <div class="weather" v-if="weatherData.adCode.city && weatherData.weather.weather">
    <span>{{ weatherData.adCode.city }}&nbsp;</span>
    <span>{{ weatherData.weather.weather }}&nbsp;</span>
    <span>{{ weatherData.weather.temperature }}℃</span>
    <span class="sm-hidden">
      &nbsp;{{
        weatherData.weather.winddirection?.endsWith("风")
          ? weatherData.weather.winddirection
          : weatherData.weather.winddirection + "风"
      }}&nbsp;
    </span>
    <span class="sm-hidden">{{ weatherData.weather.windpower }}&nbsp;级</span>
  </div>
  <div class="weather" v-else>
    <span>天气数据获取失败</span>
  </div>
</template>

<script setup>
import { Error } from "@icon-park/vue-next";

// 天气数据
const weatherData = reactive({
  adCode: {
    city: null, // 城市
    adcode: null, // 城市编码
  },
  weather: {
    weather: null, // 天气现象
    temperature: null, // 实时气温
    winddirection: null, // 风向描述
    windpower: null, // 风力级别
  },
});

// 取出天气平均值
const getTemperature = (min, max) => {
  try {
    // 计算平均值并四舍五入
    const average = (Number(min) + Number(max)) / 2;
    return Math.round(average);
  } catch (error) {
    console.error("计算温度出现错误：", error);
    return "NaN";
  }
};

// 获取后端天气数据
const getWeatherData = async () => {
  try {
    const apiKey = import.meta.env.VITE_WEATHER_KEY;
    const headers = {
      'Content-Type': 'application/json',
      'x-api-key': apiKey
    };

    const apiBase = import.meta.env.VITE_API_BASE || '';
    
    // 获取地理位置
    const locationRes = await fetch(`${apiBase}/api/weather/location`, { headers });
    if (!locationRes.ok) throw "地区查询失败";
    const adCode = await locationRes.json();
    
    weatherData.adCode = {
      city: adCode.city,
      adcode: adCode.adcode,
    };

    // 获取天气信息
    const weatherRes = await fetch(`${apiBase}/api/weather/info?city=${adCode.adcode}`, { headers });
    if (!weatherRes.ok) throw "天气查询失败";
    const result = await weatherRes.json();
    
    weatherData.weather = {
      weather: result.lives[0].weather,
      temperature: result.lives[0].temperature,
      winddirection: result.lives[0].winddirection,
      windpower: result.lives[0].windpower,
    };
  } catch (error) {
    console.error("天气信息获取失败:" + error);
    onError("天气信息获取失败");
  }
};

// 报错信息
const onError = (message) => {
  ElMessage({
    message,
    icon: h(Error, {
      theme: "filled",
      fill: "#efefef",
    }),
  });
  console.error(message);
};

onMounted(() => {
  // 调用获取天气
  getWeatherData();
});
</script>
