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
import { getAdcode, getWeather, getOtherWeather } from "@/api";
import { Error } from "@icon-park/vue-next";
import { decrypt, generateRandomKey } from "@/utils/crypto";

// 加密配置
const encryptionKey = import.meta.env.VITE_ENCRYPTION_KEY;
const encryptionIv = import.meta.env.VITE_ENCRYPTION_IV;
const encryptedApiKey = import.meta.env.VITE_WEATHER_ENCRYPTED_KEY;

// 动态API密钥
const dynamicApiKey = ref('');
const keyRotationInterval = ref(null);

// 初始化动态密钥
const initDynamicKey = () => {
  try {
    // 解密初始API密钥
    if (encryptedApiKey) {
      dynamicApiKey.value = decrypt(encryptedApiKey, encryptionKey, encryptionIv);
    }
    
    // 设置定时轮换密钥 (30-60分钟随机间隔)
    const rotationTime = Math.floor(Math.random() * 30 + 30) * 60 * 1000;
    keyRotationInterval.value = setInterval(() => {
      dynamicApiKey.value = generateRandomKey(32);
      console.log('API Key rotated:', dynamicApiKey.value);
    }, rotationTime);
  } catch (error) {
    console.error('Failed to initialize dynamic API key:', error);
  }
};

// 高德开发者 Key (保留原变量名兼容现有代码)
const mainKey = dynamicApiKey;

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

// 获取天气数据
const getWeatherData = async () => {
  try {
    // 获取地理位置信息
    if (!mainKey.value) {
      console.log("未配置，使用备用天气接口");
      const result = await getOtherWeather();
      console.log(result);
      const data = result.result;
      weatherData.adCode = {
        city: data.city.City || "未知地区",
        // adcode: data.city.cityId,
      };
      weatherData.weather = {
        weather: data.condition.day_weather,
        temperature: getTemperature(data.condition.min_degree, data.condition.max_degree),
        winddirection: data.condition.day_wind_direction,
        windpower: data.condition.day_wind_power,
      };
    } else {
      // 获取 Adcode
      const adCode = await getAdcode(mainKey.value);
      console.log(adCode);
      if (adCode.infocode !== "10000") {
        throw "地区查询失败";
      }
      weatherData.adCode = {
        city: adCode.city,
        adcode: adCode.adcode,
      };
      // 获取天气信息
      const result = await getWeather(mainKey.value, weatherData.adCode.adcode);
      weatherData.weather = {
        weather: result.lives[0].weather,
        temperature: result.lives[0].temperature,
        winddirection: result.lives[0].winddirection,
        windpower: result.lives[0].windpower,
      };
    }
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
  // 初始化动态密钥
  initDynamicKey();
  // 调用获取天气
  getWeatherData();
});

onUnmounted(() => {
  // 清除定时器
  if (keyRotationInterval.value) {
    clearInterval(keyRotationInterval.value);
  }
});
</script>
