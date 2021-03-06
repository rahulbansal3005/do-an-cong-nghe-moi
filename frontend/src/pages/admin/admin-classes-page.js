import React, { Component } from "react";
import { Table, Button, Row, Col, Modal, message } from "antd";
import CreateClassModal from "../../components/classes/create-class-modal";
import CreateScheduleModal from "../../components/schedules/create-schedule-modal";
import StudentTable from "../../components/students/student-table";
import ClassRepo from "../../repository/prop/studyclass-repository";
import ScheduleRepo from "../../repository/prop/schedule-repository";
import StudentRepo from "../../repository/prop/student-repository";

export default class AdminClassesPage extends Component {
    columns = [
        {
            title: "Tên",
            dataIndex: "name",
            key: "name",
            sorter: (a, b) => a.name.localeCompare(b.name)
        },
        {
            title: "Khối",
            dataIndex: "grade",
            key: "grade",
            sorter: (a, b) => a.grade - b.grade
        },
        {
            title: "Chức năng",
            key: "action",
            render: (record) => {
                return (
                    <Row type="flex" justify="space-between">
                        {/* <Col span={8}>
                            <Button
                                style={{ width: "90%" }}
                                type="primary"
                                onClick={async () => await this.handleEditClassButton(record)}
                            >
                                Sửa
                            </Button>
                        </Col> */}

                        <Col span={12}>
                            <Button
                                style={{ width: "90%" }}
                                type="primary"
                                onClick={async () => await this.handleStudentsButton(record)}
                            >
                                Danh sách học sinh
                            </Button>
                        </Col>

                        <Col span={12}>
                            <Button
                                style={{ width: "90%" }}
                                type="primary"
                                onClick={async () => await this.handleSchedulesButton(record)}
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
        this.handleClassStudentsModalCancel = this.handleClassStudentsModalCancel.bind(this);

        this.state = {
            searchedClasses: [],
            createClassModalVisible: false,
            scheduleModalVisible: false,
            classStudentsModalVisible: false,
            classStudents: [],
            selectedStudyclass: {},
        }
    }

    get classStudentsTitle() {
        const studyclass = this.state.selectedStudyclass;
        return `Danh sách học sinh lớp ${studyclass.name}`;
    }

    async componentDidMount() {
        await this.loadAllStudyclasses();
    }

    async loadAllStudyclasses() {
        const allClasses = await ClassRepo.getAllStudyclasses();

        if (!allClasses)
            return;

        for (let i = 0; i < allClasses.length; i++)
            allClasses[i].count = i + 1;

        this.setState({
            searchedClasses: allClasses
        });
    }

    /** Nút danh sách học sinh. */
    async handleStudentsButton(studyclass) {
        const students = await StudentRepo.getStudentsByClassId(studyclass.id);

        this.setState({
            classStudents: students,
            selectedStudyclass: studyclass,
            classStudentsModalVisible: true
        });
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
        console.log("delete", result);

        if (!result || result.error) {
            message.error("Xóa lớp học không thành công.");
        } else {
            message.success("Xóa lớp học thành công.");
            await this.loadAllStudyclasses();
        }
    }

    async handleCreateModalOk(e) {
        this.setState({
            createClassModalVisible: false
        });

        await this.loadAllStudyclasses();
    }

    handleCreateModalCancel() {
        this.setState({
            createClassModalVisible: false
        });
    }

    handleClassStudentsModalCancel() {
        this.setState({
            classStudentsModalVisible: false
        });
    }

    handleScheduleCancel() {
        this.setState({
            scheduleModalVisible: false
        });
    }

    render() {
        return (
            <div>
                <br /><br />
                <Table
                    pagination={{ hideOnSinglePage: true }}
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
                    onOk={this.handleScheduleCancel}
                    onCancel={this.handleScheduleCancel}
                    visible={this.state.scheduleModalVisible}
                />
                <Modal
                    width={750}
                    onCancel={this.handleClassStudentsModalCancel}
                    visible={this.state.classStudentsModalVisible}
                    closable={false}
                    footer={null}
                >
                    <StudentTable
                        size="small"
                        actionButtonsVisible={false}
                        title={this.classStudentsTitle}
                        students={this.state.classStudents}
                    />
                </Modal>
            </div>
        );
    }
}