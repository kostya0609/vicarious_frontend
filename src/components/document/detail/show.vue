<template>
  <div class="component-wrapper">
    <el-table
        class="tableWithOutHeader"
        :data="value">
      <el-table-column
          prop="label"
          width = "350">
      </el-table-column>
      <el-table-column>
        <template slot-scope="props">
          <p  v-for="item in props.row.value" style="margin: 0px">
            <span v-html="item"></span>
          </p>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
export default {
  name        : "documentDetailShow",
  props       : ['value'],
}
</script>

