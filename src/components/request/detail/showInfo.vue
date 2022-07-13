<template>
  <div>
    <el-table
        class="tableWithOutHeader"
        :data="show.table_1">
      <el-table-column
          prop="label_1"
          width = "350">
      </el-table-column>
      <el-table-column
          width = "350"
      >
          <template slot-scope="props">
            <p  v-for="item in props.row.value_1" style="margin: 0px">
              <span v-html="item"></span>
            </p>
          </template>
      </el-table-column>
      <el-table-column
          prop="label_2"
          width = "350">
      </el-table-column>
      <el-table-column>
        <template slot-scope="props">
          <p  v-for="item in props.row.value_2" style="margin: 0px">
            <span v-html="item"></span>
          </p>
        </template>
      </el-table-column>
    </el-table>

    <el-table
        :data="show.table_2">
      <el-table-column
          prop="label"
          width = "350">
      </el-table-column>
      <el-table-column>
        <template slot-scope="props">
          <p  v-for="item in props.row.value" style="margin: 0px">
            <span v-html="item" ></span>
          </p>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
export default {
  name  : "requestDetailShowInfo",
  props : ['show'],
}

</script>
