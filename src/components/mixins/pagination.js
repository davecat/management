/**
 * Created by dave on 2017/8/24.
 */
export const pagination = {
  data() {
    return {
      loading: false,//加载动画
      tableData: [],
      cur_page: 1,
      size: 10,
      totalElements: 0,
      url: '',
      searchForm: {},
    }
  },
  created(){
    this.getData();
  },
  methods: {
    handleCurrentChange(val){
      this.cur_page = val;
      this.getData();
    },
    getData(){
      this.loading = true;
      this.axios.post(this.url, {
        ...this.searchForm,
        page: this.cur_page - 1,
        size: this.size
      }).then((res) => {
        this.tableData = res.data.content;
        this.totalElements = res.data.totalElements;
        this.loading = false;
      }).catch((error) => {
        this.$message.error(error.response.data.message);
      })
    },
    Search() {
      this.getData();
    },
  }
};
