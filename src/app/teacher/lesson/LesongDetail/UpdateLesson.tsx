'use client';

import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { VideoUpload } from '@/components/ui/video-upload';

interface Lesson {
    _id: string;
    title: string;
    description: string;
    videoUrl: string;
    duration: number; // in minutes
    order: number;
}

interface UpdateLessonModalProps {
    isOpen: boolean;
    onClose: () => void;
    lesson: Lesson | null;
    onUpdate: (lessonId: string, updatedData: { title?: string; description?: string; videoUrl?: string; duration?: number; order?: number }) => void;
}

export function UpdateLessonModal({ isOpen, onClose, lesson, onUpdate }: UpdateLessonModalProps) {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        videoUrl: '',
        duration: 0,
        order: 0,
    });

    useEffect(() => {
        if (lesson) {
            setFormData({
                title: lesson.title || '',
                description: lesson.description || '',
                videoUrl: lesson.videoUrl || '',
                duration: lesson.duration || 0,
                order: lesson.order || 0,
            });
        }
    }, [lesson]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [id]: value,
        }));
    };

    const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [id]: Number(value),
        }));
    };

    const handleSubmit = () => {
        if (lesson) {
            onUpdate(lesson._id, formData);
            onClose();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[800px]">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">Chỉnh sửa bài học</DialogTitle>
                    <DialogDescription className="text-lg">
                        Thực hiện chỉnh sửa bài học tại đây. Nhấp lưu khi hoàn tất.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-6 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="title" className="text-right font-semibold">
                            Tiêu đề <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="title"
                            value={formData.title}
                            onChange={handleChange}
                            className="col-span-3"
                            required
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="description" className="text-right font-semibold">
                            Mô tả
                        </Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={handleChange}
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="videoUrl" className="text-right font-semibold">
                            Video bài học
                        </Label>
                        <div className="col-span-3">
                            <VideoUpload
                                onVideoUploaded={(url) => {
                                    setFormData(prev => ({ ...prev, videoUrl: url }));
                                }}
                                initialVideoUrl={formData.videoUrl}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="duration" className="text-right font-semibold">
                            Thời lượng (phút)
                        </Label>
                        <Input
                            id="duration"
                            type="number"
                            value={formData.duration}
                            onChange={handleNumberChange}
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="order" className="text-right font-semibold">
                            Thứ tự
                        </Label>
                        <Input
                            id="order"
                            type="number"
                            value={formData.order}
                            onChange={handleNumberChange}
                            className="col-span-3"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button type="submit" onClick={handleSubmit} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg text-lg">Lưu thay đổi</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}