<template>
    <div>
        <Row>
            <Col span="16">
                <Card title="Payable" dis-hover>
                    <Row>
                        <Col span="16">
                            <Card title="Debit" dis-hover>
                                <Row>
                                    <Col span="6">
                                        {{ row.item_code_payable_debit_1 }}
                                    </Col>
                                    <Col span="18" v-if="row.item_code_payable_debit_carrier_name_1">
                                        <div v-for="(item, index) in row.item_code_payable_debit_carrier_name_1" :key="index">
                                            {{ item }}
                                        </div>
                                    </Col>
                                </Row>
                                <Divider />
                                <Row v-if="row.item_code_payable_debit_2">
                                    <Col span="6">
                                        {{ row.item_code_payable_debit_2 }}
                                    </Col>
                                    <Col span="18" v-if="row.item_code_payable_debit_carrier_name_2">
                                        <div v-for="(item, index) in row.item_code_payable_debit_carrier_name_2" :key="index">
                                            {{ item }}
                                        </div>
                                    </Col>
                                </Row>
                            </Card>
                        </Col>
                        <Col span="8">
                            <Card title="Credit" dis-hover>
                                {{ row.item_code_payable_credit }}
                            </Card>
                        </Col>
                    </Row>
                </Card>
            </Col>
            <Col span="8">
                <Card title="Payment" dis-hover>
                    <Row>
                        <Col span="12">
                            <Card title="Debit" dis-hover>
                                {{ row.item_code_payment_debit }}
                            </Card>
                        </Col>
                        <Col span="12">
                            <Card title="Credit" dis-hover>
                                {{ row.item_code_payment_credit }}
                            </Card>
                        </Col>
                    </Row>
                </Card>
            </Col>
        </Row>
    </div>
</template>
<script>
export default {
    props: {
        row: Object
    }
}
</script>
