import { Request, Response } from "express"
import { Dates } from "../models/Dates";
import { UserRoles } from "../constants/UserRole";
import { Job } from "../models/Job";

//---------------------------------------------------------------------------

export const jobController = {

    //Create job
    async create(req: Request, res: Response): Promise<void> {
        try {

            const { job, tattoArtist } = req.body;

            if (!job ||  !tattoArtist ) {
                res.status(400).json({
                    message: "All fields must be provided",
                });
                return;
            }

            const jobToCreate = Job.create({
                job: job,
                tattoArtist: tattoArtist,
            });


            // Save to BD
            await Job.save(jobToCreate);

            res.status(201).json({
                message: "Job has been created",
            });

        } catch (error) {
            res.status(500).json({
                message: "Failed to create Job",
            });
        }
    },




    async getAll(req: Request, res: Response): Promise<void> {
        try {

            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 250;
            
            const [job, totalJobs] = await Dates.findAndCount({
                relations: {
                    user: true,
                    job: true,
                },
      
           
            });
            if (job.length === 0) {
                res.status(404).json({
                    message: "jobs not found",
                });
                return;
            }

            const totalPages = Math.ceil(totalJobs / limit);

            res.status(200).json({
                users: UserRoles,
                current_page: page,
                total_Jobs: totalJobs,
            });

        } catch (error) {
            res.status(500).json({
                message: "Something went wrong",
            });
        }
    },

    async getById(req: Request, res: Response): Promise<void> {
        try {
            const jobId = Number(req.params.id);

            const job = await Job.findOne({
                    select: {
                        job: true,
                    },
            
                    where: { id: jobId },
                });

            if (!job) {
                res.status(404).json({ message: "job not found" });
                return;
            }

            res.json(job);
        } catch (error) {
            res.status(500).json({
                message: "Failed to retrieve job",
            });
        }
    },

    async update(
        req: Request<{id:string}, {}, Partial <Job>>,
        res: Response): Promise<void> {
        try {
            const jobId = Number(req.params.id)
            const {...resJobData} = req.body;

            const jobToUpdate = await Job.findOne({where: {id: jobId}});
                if(!jobToUpdate) {
                    res.status(404).json({ message: "job not found" });
                    return;
                }
                console.log(jobToUpdate);
                

                
                const updatedJob: Partial<Job> = {
                    ...jobToUpdate,
                    ...resJobData,
                };
                
                await Job.save(jobToUpdate);

                res.status(202).json({
                    message: "job has been updated",
                });
                
            } catch (error) {
                res.status(500).json({
                    message: "job not found",
                });      
            }      
        },

        async delete(req: Request, res: Response): Promise <void> {
            try {
                const jobId = Number(req.params.id);

                const deleteResult = await Dates.delete(jobId);

                if(deleteResult.affected === 0) {
            res.status(404).json({ message: "job not delete" });
            return;
            }

            

            res.status(200).json({ 
                message: "job deleted successfully" });
        } catch(error) {
            res.status(500).json({
            message: "Failed to delete job",
            });
        }
    },
};