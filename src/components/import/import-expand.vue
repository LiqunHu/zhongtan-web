<style scoped>
.expand-row {
  margin-bottom: 8px;
}
</style>
<template>
  <div>
    <Row class="expand-row">
      <Col span="8">
        <h3>B/L NUMBER: {{row.import_billlading_no}}</h3>
      </Col>
      <Col span="9" offset="7">
        <h3>{{row.import_billlading_cso_no}} {{row.import_billlading_cso_no1}}</h3>
      </Col>
    </Row>
    <Row :gutter="16" class="expand-row">
      <Col span="6">
        <Card>
          <p slot="title">Info:</p>
          <p><b>SERVICE:</b> ({{row.import_billlading_srv_code}}) {{row.import_billlading_srv_name}}</p>
          <p><b>VESSEL:</b> ({{row.import_billlading_vessel_code}}) {{row.import_billlading_vessel_name}}</p>
          <p><b>VOYAGE:</b> {{row.import_billlading_voyage}}</p>
          <p><b>PLACE OF RECEIPT:</b> {{row.import_billlading_por}}</p>
          <p><b>PORT OF LOAD:</b> {{row.import_billlading_pol}}</p>
          <p><b>PORT OF DISCHARGE:</b> {{row.import_billlading_pod}}</p>
          <p><b>PLACE OF DELIVERY:</b> {{row.import_billlading_fnd}}</p>
          <p><b>SHIP FLAG:</b> {{row.import_billlading_flag}}</p>
        </Card>
      </Col>
      <Col span="6">
        <Card>
          <p slot="title">SHIPPER:</p>
          <p v-html="row.import_billlading_shipper"></p>
        </Card>
      </Col>
      <Col span="6">
        <Card>
          <p slot="title">CONSIGNEE:</p>
          <p v-html="row.import_billlading_consignee"></p>
        </Card>
      </Col>
      <Col span="6">
        <Card>
          <p slot="title">NOTIFY PARTY :</p>
          <p v-html="row.import_billlading_notify_party"></p>
        </Card>
      </Col>
      <Col span="6">
        <Card>
          <p slot="title">REMARKS :</p>
          <p v-html="row.import_billlading_remark"></p>
        </Card>
      </Col>
    </Row>
    <Row class="expand-row">
      <Col>
        <Card>
          <p slot="title">GOODS:</p>
          <Table stripe size="small" ref="goodsTable" :columns="table.goodsTable.columns" :data="row.goods">
            <template slot-scope="{ row, index }" slot="packages">{{row.import_billlading_goods_package_number + ' ' + row.import_billlading_goods_package_unit}}</template>
          </Table>
        </Card>
      </Col>
    </Row>
    <Row class="expand-row">
      <Col>
        <Card>
          <p slot="title">OCEAN FREIGHT:</p>
          <Table stripe size="small" ref="freightTable" :columns="table.freightTable.columns" :data="rowdata"></Table>
        </Card>
      </Col>
    </Row>
    <Row class="expand-row">
      <Col>
        <Card>
          <p slot="title">CHARGES:</p>
          <Table stripe size="small" ref="chargesTable" :columns="table.chargesTable.columns" :data="row.charges"></Table>
        </Card>
      </Col>
    </Row>
    <Row class="expand-row">
      <Col>
        <Card>
          <p slot="title">Container:</p>
          <Table stripe size="small" ref="containerTable" :columns="table.containerTable.columns" :data="row.container">
            <template slot-scope="{ row, index }" slot="packages">{{row.import_billlading_container_package_cnt + ' ' + row.import_billlading_container_cnt_unit}}</template>
          </Table>
        </Card>
      </Col>
    </Row>
    <Row class="expand-row">
      <Col>
        <Card>
          <p slot="title">Total:</p>
          <Table stripe size="small" ref="goodsTotalTable" :columns="table.goodsTotalTable.columns" :data="rowdata">
            <template slot-scope="{ row, index }" slot="packages">{{row.import_billlading_total_packno + ' ' + row.import_billlading_total_unit}}</template>
          </Table>
          <Table stripe size="small" ref="chargesTotalTable" :columns="table.chargesTotalTable.columns" :data="row.sumcharges"></Table>
        </Card>
      </Col>
    </Row>
  </div>
</template>
<script>
const common = require('@/lib/common')

export default {
  props: {
    row: Object
  },
  data: function() {
    return {
      table: {
        goodsTable: {
          columns: [
            {
              title: 'Description',
              key: 'import_billlading_goods_description',
              render: common.tooltipBrRender(),
              width: 300
            },
            {
              title: 'Packages',
              slot: 'packages'
            },
            {
              title: 'Gross Weight(kg)',
              key: 'import_billlading_goods_gross_weight_kg'
            },
            {
              title: 'Volume(cmb)',
              key: 'import_billlading_goods_volume_cbm'
            },
            {
              title: 'Gross Weight(lb)',
              key: 'import_billlading_goods_gross_weight_lb'
            },
            {
              title: 'Volume(cft)',
              key: 'import_billlading_goods_volume_cft'
            },
            {
              title: 'marks',
              key: 'import_billlading_goods_marks_num',
              render: common.tooltipBrRender(),
              width: 300
            }
          ]
        },
        freightTable: {
          columns: [
            {
              title: 'Rate',
              key: 'import_billlading_ocean_freight_rate'
            },
            {
              title: 'PC indicator',
              key: 'import_billlading_ocean_freight_pc'
            },
            {
              title: 'Total amount',
              key: 'import_billlading_ocean_freight_ttl_ame'
            },
            {
              title: 'Currency',
              key: 'import_billlading_ocean_freight_currency'
            },
            {
              title: 'Pay local',
              key: 'import_billlading_ocean_freight_pay_loc'
            }
          ],
          data: []
        },
        chargesTable: {
          columns: [
            {
              title: 'Type',
              key: 'import_billlading_charges_type'
            },
            {
              title: 'Description',
              key: 'import_billlading_charges_description'
            },
            {
              title: 'Basis',
              key: 'import_billlading_charges_basis'
            },
            {
              title: 'Rate',
              key: 'import_billlading_charges_rate'
            },
            {
              title: 'PC indicator',
              key: 'import_billlading_charges_pc'
            },
            {
              title: 'Total amount',
              key: 'import_billlading_charges_ttl_ame'
            },
            {
              title: 'Currency',
              key: 'import_billlading_charges_currency'
            },
            {
              title: 'Pay local',
              key: 'import_billlading_charges_pay_loc'
            }
          ]
        },
        containerTable: {
          columns: [
            {
              title: 'Container No.',
              key: 'import_billlading_container_num'
            },
            {
              title: 'Seal No.',
              key: 'import_billlading_container_seal'
            },
            {
              title: 'Type',
              key: 'import_billlading_container_type'
            },
            {
              title: 'Num Of Packs',
              slot: 'packages'
            },
            {
              title: 'Traffic',
              key: 'import_billlading_container_traffic_mode'
            },
            {
              title: 'Shpr Weight(kg)',
              key: 'import_billlading_container_weight'
            },
            {
              title: 'Tare Weight',
              key: 'import_billlading_container_tare_weight'
            }
          ]
        },
        goodsTotalTable: {
          columns: [
            {
              title: 'Packages',
              slot: 'packages'
            },
            {
              title: 'Gross Weight(kg)',
              key: 'import_billlading_total_gross_weight_kg'
            },
            {
              title: 'Volume(cbm)',
              key: 'import_billlading_total_volume_cbm'
            },
            {
              title: 'Gross Weight(lb)',
              key: 'import_billlading_total_gross_weight_lb'
            },
            {
              title: 'Volume(cft)',
              key: 'import_billlading_total_volume_cft'
            }
          ]
        },
        chargesTotalTable: {
          columns: [
            {
              title: 'PC indicator',
              key: 'import_billlading_sumcharges_pc'
            },
            {
              title: 'Currency',
              key: 'import_billlading_sumcharges_currency'
            },
            {
              title: 'Amount',
              key: 'import_billlading_sumcharges_amt'
            }
          ]
        }
      },
      rowdata: []
    }
  },
  mounted: function() {
    this.rowdata = []
    this.rowdata.push(this.row)
  }
}
</script>