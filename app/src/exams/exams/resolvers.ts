import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";

import {
    lists,
    counts,
    getExamById,
    getClassByExam,
    insertExam,
    updateExam,
    insertExamClass,
    updateExamClassByExam,
    deleteClassExamById,
    getQuestionsByExam,
    getCountQuestionByExam,
    getExamQuestionById,
    insertExamQuestion,
    updateExamQuestion,
    getAssignByExam,
    insertAssign,
    getUserAnswerByExam,
    insertUserAnswer,
    updateUserAnswerById
} from "./businesses";

import Joi from "joi";
import { getToken } from "../../../helpers/token";
import { getAnswersByQuestion } from "../questions/businesses";
const schema = Joi.object({
    lesson_id: Joi.string().required(),
    type: Joi.string().required(),
    status: Joi.string().required(),
    duration: Joi.number().required().default(0),
    minimum_result: Joi.number().required().default(0),
    title: Joi.string().required(),
    description: Joi.string().allow(null),
    author: Joi.string().allow(null),
    classes: Joi.array().items(Joi.object({
        class_id: Joi.string().required()
    })).required()
});

/**
 * Exams - Master
 */

async function list(req: Request, res: Response) {
    try {
        const data = await lists(req);
        const totalPage = await counts(req);

        res.status(200).json({
            data,
            totalPage
        });
    } catch (error: any) {
        res.status(400).json({ error: error?.message });
    }
}

async function detail(req: Request, res: Response) {
    try {
        const id = req.params.id;
        let data: any = await getExamById(id);
        if (!data) return res.status(404).json({ message: "Data is not found" });

        /**
         * Get classes in this exam
         */
        data.classes = await getClassByExam(data.id);

        res.status(200).json({ data });
    } catch (error: any) {
        res.status(400).json({ error: error?.message });
    }
}

async function insert(req: Request, res: Response) {
    try {
        const body = req.body;
        await schema.validateAsync(body);

        /**
         * Get user login from token
         */
        const loggedId = await getToken(req, "user_id");

        /**
         * Prepare and insert exams
         */
        const data = {
            id: uuidv4(),
            lesson_id: body.lesson_id,
            type: body.type,
            status: body.status,
            duration: parseInt(body.duration),
            minimum_result: parseInt(body.minimum_result),
            title: body.title,
            description: body.description,
            author: body.author,
            created_at: new Date(),
            created_by: loggedId
        }
        await insertExam(data);

        /**
         * Prepare and insert exam_class
         */
        for (let i = 0; i < body.classes.length; i++) {
            await insertExamClass({
                id: uuidv4(),
                exam_id: data.id,
                class_id: body.classes[i].class_id,
                created_at: new Date(),
                created_by: loggedId
            });
        }

        res.status(201).json({ message: "Data is successfully inserted", data });
    } catch (error: any) {
        res.status(400).json({ error: error?.message });
    }
}

async function update(req: Request, res: Response) {
    try {
        const id = req.params.id;
        const body = req.body;
        await schema.validateAsync(body);

        /**
         * Check existing
         */
        const exists = await getExamById(id);
        if (!exists) return res.status(404).json({ message: "Data is not found" });

        /**
         * Get user login from token
         */
        const loggedId = await getToken(req, "user_id");

        /**
         * Prepare and update data exam
         */
        const data = {
            id: exists.id,
            lesson_id: body.lesson_id,
            type: body.type,
            status: body.status,
            duration: parseInt(body.duration),
            minimum_result: parseInt(body.minimum_result),
            title: body.title,
            description: body.description,
            author: body.author,
            updated_at: new Date(),
            updated_by: loggedId
        }
        await updateExam(data);

        /**
         * Remove and re-insert exam_class
         */
        let classes = await getClassByExam(data.id);
        await Promise.all(classes.map(async (v: any) => {
            const x = body.classes.find((x: any) => x.class_id == v.class_id);
            if (x === undefined) await deleteClassExamById(v.id);
        }));

        classes = await getClassByExam(data.id);
        await Promise.all(body.classes.map(async (v: any) => {
            const x = classes.find((x: any) => x.class_id == v.class_id);
            if (x === undefined) {
                await insertExamClass({
                    id: uuidv4(),
                    exam_id: data.id,
                    class_id: v.class_id,
                    created_at: new Date(),
                    created_by: loggedId
                });
            }
        }));

        res.status(201).json({ message: "Data is successfully updated", data });
    } catch (error: any) {
        res.status(400).json({ error: error?.message });
    }
}

async function remove(req: Request, res: Response) {
    try {
        const id = req.params.id;
        const data = await getExamById(id);
        if (!data) return res.status(404).json({ message: "Data is not found" });

        /**
         * Get user login from token
         */
        const loggedId = await getToken(req, "user_id");

        /**
         * Delete exam data
         */
        await updateExam({
            id: data.id,
            deleted: true,
            updated_at: new Date(),
            updated_by: loggedId
        });

        /**
         * Delete exam_class data
         */
        await updateExamClassByExam({
            exam_id: data.id,
            deleted: true,
            updated_at: new Date(),
            updated_by: loggedId
        });

        res.status(201).json({ message: "Data is successfully deleted" });
    } catch (error: any) {
        res.status(400).json({ error: error?.message });
    }
}

/**
 * Exams - Question
 */

const questionSchema = Joi.object({
    questions: Joi.array().items(Joi.object({
        question_id: Joi.string().required()
    })).required()
});

async function listQuestions(req: Request, res: Response) {
    try {
        const exam_id = req.params.exam_id;
        let data: any = await getQuestionsByExam(req, exam_id);
        const totalPage = await getCountQuestionByExam(req, exam_id);

        /**
         * Get answers
         */
        await Promise.all(data.map(async (v: any, i: any) => {
            data[i].answers = await getAnswersByQuestion(v.question_id, true);
        }));

        res.status(200).json({
            data,
            totalPage
        });
    } catch (error: any) {
        res.status(400).json({ error: error?.message });
    }
}

async function insertQuestions(req: Request, res: Response) {
    try {
        const exam_id = req.params.exam_id;
        const exam = await getExamById(exam_id);
        if (!exam) return res.status(404).json({ message: "Data is not found" });

        const body = req.body;
        await questionSchema.validateAsync(body);

        /**
         * Get user login from token
         */
        const loggedId = await getToken(req, "user_id");

        /**
         * Prepare and insert data
         */
        await Promise.all(body.questions.map(async (v: any) => {
            await insertExamQuestion({
                id: uuidv4(),
                exam_id,
                question_id: v.question_id,
                created_at: new Date(),
                created_by: loggedId
            });
        }));

        res.status(201).json({ message: `${body.questions.length} Data(s) successfully inserted` });
    } catch (error: any) {
        res.status(400).json({ error: error?.message });
    }
}

async function removeQuestion(req: Request, res: Response) {
    try {
        const id = req.params.id;
        const data = await getExamQuestionById(id);
        if (!data) return res.status(404).json({ message: "Data is not found" });

        /**
         * Get user login from token
         */
        const loggedId = await getToken(req, "user_id");

        /**
         * Update exam question
         */
        await updateExamQuestion({
            id: data.id,
            deleted: true,
            created_at: new Date(),
            created_by: loggedId
        });

        res.status(201).json({ message: "Data is successfully deleted" });
    } catch (error: any) {
        res.status(400).json({ error: error?.message });
    }
}

/**
 * Exams - Assigns
 */

async function assigns(req: Request, res: Response) {
    try {
        const exam_id = req.params.exam_id;
        const exams = await getExamById(exam_id);
        if (!exams) return res.status(404).json({ message: "Data is not found" });

        /**
         * Get user login from token
         */
        const loggedId = await getToken(req, "user_id");

        /**
         * Prepare, validate and insert
         */
        const data = {
            id: uuidv4(),
            exam_id: exams.id,
            user_id: loggedId,
            status: "S1",
            created_at: new Date(),
            created_by: loggedId
        }

        const exists = await getAssignByExam(exam_id, loggedId);
        if (exists) return res.status(200).json({ message: "You are already assigned", exists })
        await insertAssign(data);

        res.status(201).json({ message: "You are successfully assigned to this exam", data });
    } catch (error: any) {
        res.status(400).json({ error: error?.message });
    }
}

/**
 * Exams - Submit
 */

const syncSchema = Joi.object({
    data: Joi.array().items(Joi.object({
        exam_question_id: Joi.string().required(),
        question_id: Joi.string().required(),
        answer_id: Joi.string().allow(null),
        answer_text: Joi.string().allow(null),
        answered_at: Joi.string().allow(null),
        correction_points: Joi.number().default(0)
    }))
});

async function sync(req: Request, res: Response) {
    /**
     * This function will called repeatly per-10mins from frontend
     * Record every answers to database to prevent computer shut down or another hardware troubles
     */
    try {
        /**
         * Check existing exam
         */
        const exam_id = req.params.exam_id;
        const exam = await getExamById(exam_id);
        if (!exam) return res.status(404).json({ message: "Data is not found" });

        /**
         * Validate body input
         */
        const body = req.body;
        await syncSchema.validateAsync(body);

        /**
         * Get user login from token
         */
        const loggedId = await getToken(req, "user_id");

        /**
         * Prepare data to update
         */
        let temp_answers = await getUserAnswerByExam(exam_id, loggedId);
        await Promise.all(body.map(async (v: any) => {
            const answered = v.answered_at ? v.answered_at : new Date();
            /**
             * Update answer if user already answered it before
             * Otherwise insert the answer
             */
            const x = temp_answers.findIndex((x: any) => x.exam_question_id === v.exam_question_id);
            if (x < 0) {
                await insertUserAnswer({
                    id: uuidv4(),
                    exam_question_id: v.exam_question_id,
                    user_id: loggedId,
                    question_id: v.question_id,
                    answer_id: v.answer_id,
                    answer_text: v.answer_text,
                    correction_points: v.correction_points,
                    answered_at: answered,
                    created_at: new Date(),
                    created_by: loggedId
                });
            } else {
                await updateUserAnswerById({
                    id: temp_answers[x].id,
                    answer_id: v.answer_id,
                    answer_text: v.answer_text,
                    correction_points: v.correction_points,
                    answered_at: answered,
                    updated_at: new Date(),
                    updated_by: loggedId
                });
            }
        }));

        res.status(201).json({ message: "Your answer is successfully saved", body });
    } catch (error: any) {
        res.status(400).json({ error: error?.message });
    }
}

async function submit(req: Request, res: Response) {
    try {

    } catch (error: any) {
        res.status(400).json({ error: error?.message });
    }
}

/**
 * Exports
 */

export {
    list,
    detail,
    insert,
    update,
    remove,
    listQuestions,
    insertQuestions,
    removeQuestion,
    assigns,
    sync,
    submit
}