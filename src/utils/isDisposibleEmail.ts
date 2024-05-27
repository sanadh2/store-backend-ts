import axios, { AxiosResponse, AxiosError, isAxiosError } from "axios";

const disposibleEmailCheckerAPI = process.env.DISPOSIBLE_API as string;

export default async function isDisposableEmail(
  email: string
): Promise<boolean> {
  try {
    const response: AxiosResponse<{ disposable: "false" | "true" }> =
      await axios.get(disposibleEmailCheckerAPI + "/?email=" + email);
    return response.data.disposable == "true";
  } catch (error: unknown) {
    if (isAxiosError(error) && error.response) {
      console.log("error message :\t", error.message);
      console.error("Error response from API:", error.response.data);
      return error.response.data.disposable ?? true;
    } else {
      console.error("Unexpected error:", error);
      return true;
    }
  }
}
