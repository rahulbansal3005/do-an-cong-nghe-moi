import axios from "axios";
import { schedulesEndpoint } from "./endpoints";

class ScheduleRepository {
    cachedValues = [];
    refeshCachedValues = false;

    async createSchedule(classId, teacherId, time, date, semester, state, subject) {
        try {
            let schedule = {
                classId: classId,
                teacherId: teacherId,
                time: time,
                date: date,
                semester: semester,
                state: state,
                subject: subject
            };

            const result = await axios.post(schedulesEndpoint, schedule);
            if (!result.data.success)
                return result.data.error;

            schedule.id = result.data.body.sortKey;
            schedule.classId = result.data.body.data;
            this.refeshCachedValues = true;
            return schedule;
        } catch (error) {
            return { error: error.message };
        }
    }

    async deleteSchedule(id) {
        try {
            const result = await axios.delete(`${schedulesEndpoint}/${id}`);
            this.refeshCachedValues = true;
            return result.data.success ? result.data.body : { error: result.data.error };
        } catch (error) {
            return { error: error };
        }
    }

    async updateSchedule(schedule) {
        try {
            const result = await axios.patch(`${schedulesEndpoint}/${schedule.id}`, schedule);
            this.refeshCachedValues = true;
            return result.data.success ? result.data.body : { error: result.data.error };
        } catch (error) {
            return { error: error };
        }
    }

    async getAllSchedules() {
        if (!this.refeshCachedValues && this.cachedValues && this.cachedValues.length > 0)
            return this.cachedValues;

        try {
            const result = await axios.get(schedulesEndpoint);
            if (!result.data.success)
                return { error: result.data.error };

            for (let i = 0; i < result.data.body.Items.length; i++) {
                result.data.body.Items[i].id = result.data.body.Items[i].sortKey;
                result.data.body.Items[i].classId = result.data.body.Items[i].data;
            }

            this.cachedValues = result.data.body.Items;
            this.refeshCachedValues = false;
            return result.data.body.Items;
        } catch (error) {
            return { error: error };
        }
    }

    async getScheduleById(id) {
        try {
            const result = await axios.get(`${schedulesEndpoint}/${id}`);
            if (!result.data.success)
                return result.data.error;

            if (result.data.body.Items.length < 1)
                return { error: "NotFound" };

            const schedule = result.data.body.Items[0];
            return {
                id: schedule.sortKey,
                classId: schedule.data,
                teacherId: schedule.teacherId,
                time: schedule.time,
                date: schedule.date,
                semester: schedule.semester,
                state: schedule.state,
                subject: schedule.subject
            };
        } catch (error) {
            return { error: error };
        }
    }

    async getSchedulesByClassId(classId) {
        const result = await this.getAllSchedules();
        if (result.error)
            return result;

        return result.filter(schedule => schedule.classId == classId);
    }

    async getSchedulesByTeacherId(teacherId) {
        const result = await this.getAllSchedules();
        if (result.error)
            return result;

        return result.filter(schedule => schedule.teacherId == teacherId);
    }
}

const scheduleRepository = new ScheduleRepository();
export default scheduleRepository;