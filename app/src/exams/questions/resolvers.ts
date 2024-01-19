import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";

import {
    lists,
    counts,
    getQuestionById,
    getAnswersByQuestion,
    insertQuestion,
    insertAnswer,
    updateQuestion,
    updateAnswersByQuestion
} from "./businesses";

import Joi from "joi";
import { getToken } from "../../../helpers/token";
const schema = Joi.object({
    lesson_id: Joi.string().required(),
    type: Joi.string().required().allow("T1"),
    question: Joi.string().required(),
    points: Joi.number().default(0),
    tags: Joi.array().items({
        tag_id: Joi.string().required()
    }).default([]),
    attachments: Joi.array().items(Joi.object({
        filename: Joi.string().required(),
        filesize: Joi.string().allow(null),
        filetype: Joi.string().allow(null)
    })).default([]),
    answers: Joi.array().items(Joi.object({
        answer: Joi.string().required(),
        points: Joi.number().default(0),
        attachments: Joi.array().items(Joi.object({
            filename: Joi.string().required(),
            filesize: Joi.string().allow(null),
            filetype: Joi.string().allow(null)
        })).default([]),
    })).default([])
});

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
        let data: any = await getQuestionById(id);
        if (!data) return res.status(404).json({ message: "Data is not found" });

        /**
         * Get answer list
         */
        data.answers = await getAnswersByQuestion(data.id);

        res.status(200).json({ data });
    } catch (error: any) {
        res.status(400).json({ error: error?.message });
    }
}

async function insert(req: Request, res: Response) {
    try {
        const body: any = req.body;
        await schema.validateAsync(body);

        /**
         * Get user login from token
         */
        const loggedId = await getToken(req, "user_id");

        /**
         * Prepare and insert data
         */
        let tags: any = [];
        for (let i = 0; i < body.tags.length; i++) {
            tags.push(body.tags[i].tag_id);
        }

        let attachments: any = [];
        for (let i = 0; i < body.attachments.length; i++) {
            /**
             * Upload image/file to cdns/ folder
             */
        }

        let data: any = {
            id: uuidv4(),
            lesson_id: body.lesson_id,
            type: body.type,
            question: body.question,
            points: parseInt(body.points),
            tags: JSON.stringify(tags),
            attachments: JSON.stringify(attachments),
            created_at: new Date(),
            created_by: loggedId
        }
        await insertQuestion(data);

        /**
         * Prepare and insert answers
         */
        await Promise.all(body.answers.map(async (v: any) => {
            let answerAttachments: any = [];
            for (let i = 0; i < v.attachments.length; i++) {
                /**
                 * Upload image/file to cdns/ folder
                 */
            }

            await insertAnswer({
                id: uuidv4(),
                question_id: data.id,
                answer: v.answer,
                points: parseInt(v.points),
                attachments: JSON.stringify(answerAttachments),
                created_at: new Date(),
                created_by: loggedId
            });
        }));

        res.status(201).json({ message: "Data is successfully inserted", data });
    } catch (error: any) {
        res.status(400).json({ error: error?.message });
    }
}

async function update(req: Request, res: Response) {

}

async function remove(req: Request, res: Response) {
    try {
        const id = req.params.id;
        const data: any = await getQuestionById(id);
        if (!data) return res.status(404).json({ message: "Data is not found" });

        /**
         * Get user login from token
         */
        const loggedId = await getToken(req, "user_id");

        /**
         * Update question and answer tables
         */
        await updateQuestion({
            id: data.id,
            deleted: true,
            updated_at: new Date(),
            updated_by: loggedId
        });

        await updateAnswersByQuestion({
            question_id: data.id,
            deleted: true,
            updated_at: new Date(),
            updated_by: loggedId
        });

        res.status(201).json({ message: "Data is successfully deleted" });
    } catch (error: any) {
        res.status(400).json({ error: error?.message });
    }
}

export {
    list,
    detail,
    insert,
    update,
    remove
}