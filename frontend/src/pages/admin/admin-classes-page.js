import React, { Component } from "react";
import { Table, Input, Button, Row, Col, Modal } from "antd";
import CreateClassModal from "../../components/classes/create-class-modal";
import CreateScheduleModal from "../../components/schedules/create-schedule-modal";
import ClassRepo from "../../repository/prop/studyclass-repository";
import ScheduleRepo from "../../repository/prop/schedule-repository";

const { Search } = Input;

export default class AdminClassesPage extends Component {
    columns = [
        {
            title: "TT",
            dataIndex: "count",
            key: "count"
        },
        {
            title: "Tên",
            dataIndex: "name",
            key: "name",
        },
        {
            title: "Khối",
            dataIndex: "grade",
            key: "grade"
        },
        {
            title: "Chức năng",
            key: "action",
            render: (record) => {
                return (
                    <Row type="flex" justify="space-between">
                        <Col span={6}>
                            <Button
                                style={{ width: "90%" }}
                                type="primary"
                                onClick={async () => this.handleEditClassButton(record)}
                            >
                                Sửa
                            </Button>
                        </Col>
                        
                        <Col span={6}>
                            <Button 
                                style={{ width: "90%" }}
                                type="primary"
                                onClick={async () => this.handleDeleteClassButton(record)}
                            >
                                Xóa
                            </Button>
                        </Col>
                                 
                        <Col span={6}>
                            <Button 
                                style={{ width: "90%" }}
                                type="primary"
                                onClick={async () => this.handleStudentsButton(record)}
                            >
                                Danh sách học sinh
                            </Button>
                        </Col>

                        <Col span={6}>
                            <Button 
                                style={{ width: "90%" }}
                                type="primary"
                                onClick={async () => this.handleSchedulesButton(record)}
                            >
                                Thời khóa biểu
                            </Button>
                        </Col>

                    </Row>
                );
            }
        }
    ];

    title = () => {
        return (
            <Row justify="end">
                <Col span={3}>
                    <h3>Danh sách lớp học</h3>
                </Col>
                <Col span={3} offset={18}>
                    <Button onClick={this.handleCreateClassButton}>
                        Thêm
                    </Button>
                </Col>
            </Row>
        );
    }

    constructor(props) {
        super(props);

        this.handleCreateClassButton = this.handleCreateClassButton.bind(this);
        this.handleEditClassButton = this.handleEditClassButton.bind(this);
        this.handleDeleteClassButton = this.handleDeleteClassButton.bind(this);
        this.handleCreateModalCancel = this.handleCreateModalCancel.bind(this);
        this.handleCreateModalOk = this.handleCreateModalOk.bind(this);
        this.handleStudentsButton = this.handleStudentsButton.bind(this);
        this.handleSchedulesButton = this.handleSchedulesButton.bind(this);
        this.handleScheduleCancel = this.handleScheduleCancel.bind(this);
        this.handleScheduleOk = this.handleScheduleOk.bind(this);

        this.state = {
            searchedClasses: [],
            createClassModalVisible: false,
            scheduleModalVisible: false,
            selectedStudyclass: {}
        }
    }

    async componentDidMount() {
        await this.loadAllStudyclasses();
    }

    async loadAllStudyclasses() {
        const allClasses = await ClassRepo.getAllStudyclasses();

        if (!allClasses)
            return;

        for(let i = 0; i < allClasses.length; i++)
            allClasses[i].count = i + 1;

        this.setState({
            searchedClasses: allClasses
        });
    }

    /** Nút danh sách học sinh. */
    handleStudentsButton(e) {
        console.log("Danh sách học sinh", e);
    }

    /** Nút thời khóa biểu */
    handleSchedulesButton(studyclass) {
        this.setState({
            scheduleModalVisible: true,
            selectedStudyclass: studyclass
        });
    }

    /** Nút thêm lớp */
    handleCreateClassButton() {
        this.setState({
            createClassModalVisible: true
        });
    }

    /** Nút sửa lớp */
    handleEditClassButton(e) {
        console.log("Sửa lớp", e);
    }

    async handleDeleteClassButton(e) {

        const result = await ClassRepo.deleteStudyclass(e.id);

        if (result.error) {
            Modal.error({
                title: "Lỗi",
                content: `Xóa lớp học thất bại: ${result.error}`
            });
        } else {
            Modal.success({
                title: "Thành công",
                content: "Lớp học được xóa thành công"
            });
            await this.loadAllStudyclasses();
        }
    }

    async handleCreateModalOk(e) {
        let result = await ClassRepo.createStudyclass(e.name, e.grade);  

        if (result.error) {
            Modal.error({
                title: "Lỗi",
                content: `Thêm lớp học thất bại: ${result.error}.`
            });
        } else {
            Modal.success({
                title: "Thành công",
                content: "Lớp học được thêm thành công."
            });
            await this.loadAllStudyclasses();
            this.setState({
                createClassModalVisible: false
            });
        }
    }

    handleCreateModalCancel() {
        this.setState({
            createClassModalVisible: false
        });
    }

    async handleScheduleOk(scheduleDetails) {
        if (!scheduleDetails || scheduleDetails.length < 1) {
            Modal.warning({
                title: "Cảnh báo",
                content: "Không tìm thấy chi tiết nào trong lịch học."
            });
        } else {
            for(let i = 0; i < scheduleDetails.length; i++) {
                const detail = scheduleDetails[i];
                const result = await ScheduleRepo.createSchedule(
                    detail.studyclass.id,
                    detail.teacher.id,
                    detail.time,
                    detail.date,
                    detail.semester,
                    detail.state,
                    detail.subject
                );

                if (result.error) {
                    Modal.error({
                        title: "Lỗi",
                        content: `Thêm chi tiết thời khóa biểu thất bại: ${result.error}.`
                    });
                } else {
                    Modal.success({
                        title: "Thành công",
                        content: "Thêm chi tiết thời khóa biểu thành công."
                    });
                }
            }

            this.setState({
                scheduleModalVisible: false
            });
        }
    }

    handleScheduleCancel() {
        this.setState({
            scheduleModalVisible: false
        });
    }

    render() {
        return ( 
            <div>
                <Search/>
                <br/><br/>
                <Table 
                    pagination={{hideOnSinglePage: true}}
                    columns={this.columns}
                    bordered
                    title={this.title}
                    rowKey={record => record.id}
                    dataSource={this.state.searchedClasses}
                />
                <CreateClassModal 
                    onOk={this.handleCreateModalOk}
                    onCancel={this.handleCreateModalCancel}
                    visible={this.state.createClassModalVisible}
                />
                <CreateScheduleModal
                    studyclass={this.state.selectedStudyclass}
                    onOk={this.handleScheduleOk}
                    onCancel={this.handleScheduleCancel}
                    visible={this.state.scheduleModalVisible}
                />
            </div>
        );
    }
}