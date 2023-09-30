import { AxiosError, AxiosResponse } from "axios";
import { UserApi, UserInfo } from "../api"
import { Configuration } from "../configuration";

it('should fail with ENOTFOUND when supplied with invalid host', async () => {
    const config = new Configuration({
        basePath: "http://coolbdskjfhsdjfhsdkjfhkdsjfheanz.brotwurst",
      });
    const userApi: UserApi = new UserApi(config)
    var didFailCorrectly = false
    await userApi.userGet().then((e: AxiosResponse<UserInfo>) => {
        console.log(e)
    })
    .catch((reason: AxiosError) => {
        if (reason.code==='ENOTFOUND') {
            didFailCorrectly = true
        }
    });
    expect(didFailCorrectly).toBe(true)
})