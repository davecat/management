/**
 * Created by dave on 2017/8/24.
 */
export const qiniu = {
    data() {
        return {
            qiniu: process.env.QINIU,
            uploadUrl: process.env.UPLOAD,
            postData: {
                token: ''
            },
        }
    },
    methods: {
        getUploadToken() {
            return this.axios.get('/api/v2/upload/getToken').then((res) => {
                this.postData.token = res.data;
            }).catch((error) => {
                this.$message.error(error.response.data.message);;
            })
        },
        beforeUpload(file) {
            return this.getUploadToken();
        },
        photo(token) {
            if (token !== undefined && token !== '' && token !== null) {
                return this.qiniu + token + '?imageMogr2/auto-orient/thumbnail/600x600';
            }
        },
    }
}
