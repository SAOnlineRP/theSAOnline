const BASE_URL = "http://localhost:3000";

const API_URL = `${BASE_URL}/api`;
const API_CATALOG_URL = `${BASE_URL}/api/admin`;
const API_REGISTER_URL = `${BASE_URL}/api/register`;

async function apiRequest(method, body) {

    const token =
        localStorage.getItem("access_token");

    const response =
        await fetch(API_URL, {
            method,
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(body)
        });

    const result =
        await response.json();

    if (!response.ok) {
        throw new Error(
            result.error ||
            "Request failed"
        );
    }

    return result;
}

async function apiCatalogRequest(body) {

  const token =
    localStorage.getItem("access_token");

  try {

    const response = await fetch(API_CATALOG_URL, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },

      body: JSON.stringify(body),
    });

    const result =
      await response.json();

    if (!result.success) {
      throw new Error(
        result.error || "API Error"
      );
    }

    return result.data;

  } catch (err) {

    console.error(
      "API Request Error:",
      err
    );

    return null;
  }
}