function convertToJson(res) {
  if (res.ok) {
    return res.json();
  } else {
    throw new Error("Bad Response");
  }
}

const baseURL = import.meta.env.VITE_SERVER_URL || "https://wdd330-backend.onrender.com/";

export default class ProductData {
  async getData(category) {
  try {
    const url = `${baseURL}products/search/${category}`;
    const response = await fetch(url);
    const data = await convertToJson(response);
    return data.Result;
  } catch (err) {
    console.error("API fetch failed for category:", category, err);
    return [];
  }
}



  async findProductById(id) {
    const categories = ["tents", "backpacks", "sleeping-bags", "hammocks"];
    for (const cat of categories) {
      const products = await this.getData(cat);
      const match = products.find(item => String(item.Id).toLowerCase() === String(id).toLowerCase());
      if (match) return match;
    }
    return null;
  }
}
