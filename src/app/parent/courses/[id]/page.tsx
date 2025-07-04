"use client";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  BookOpen,
  CheckCircle,
  ChevronLeft,
  Clock,
  Play,
  Shield,
  Star,
  User,
  Heart,
  Download,
  Share2,
  Lock,
  Crown,
  MessageCircle,
  ThumbsUp,
  Send,
} from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import {
  getCourseById,
  getLessonsByCourse,
  createCourseReview,
  
} from "@/lib/api";
import { use } from "react";
import {
  canAccessCourse,
  checkCourseAccess,
  getPremiumStatusInfo,
  redirectToPremiumUpgrade,
} from "@/utils/premium";
import { toast } from "sonner";
import { getReviewsByCourseId,updateCourseReview,
  deleteCourseReview, } from "@/utils/apis";

interface Course {
  _id: string;
  title: string;
  description: string;
  category: string;
  ageGroup: string;
  thumbnailUrl?: string;
  pointsEarned: number;
  isPremium: boolean;
  instructor: {
    _id: string;
    fullName: string;
    specializations: string[];
  };
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Lesson {
  _id: string;
  courseId: {
    _id: string;
    title: string;
    category: string;
  };
  title: string;
  description: string;
  content?: {
    sections: {
      title: string;
      text: string;
    }[];
  };
  videoUrl?: string;
  audioUrl?: string;
  imageUrl?: string;
  duration: number;
  order: number;
  isPublished: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface Review {
  _id: string;
  courseId: {
    _id: string;
    title: string;
    category: string;
  };
  kidId?: {
    _id: string;
    fullName: string;
  };
  parentId?: {
    _id: string;
    fullName: string;
  };
  star: number;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export default function ParentCourseDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const courseId = resolvedParams.id;
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [premiumStatus, setPremiumStatus] = useState({
    isPremium: false,
    displayText: "Gói Miễn phí",
  });
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [newReview, setNewReview] = useState({ star: 5, content: "" });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [editReview, setEditReview] = useState<{ star: number; content: string }>({ star: 5, content: "" });
  const parentData = typeof window !== 'undefined' ? localStorage.getItem("parentData") : null;
  const parentId = parentData ? (JSON.parse(parentData).data?.id || JSON.parse(parentData).data?._id) : null;

  // Tối ưu hóa: Gọi course trước, sau đó lessons với better error handling
  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log("🔄 [Parent] Fetching course data for:", courseId);

        // Fetch course first (mandatory)
        let courseResponse;
        try {
          courseResponse = await getCourseById(courseId);
          console.log("✅ [Parent] Course data fetched successfully");
        } catch (courseError) {
          console.error("❌ [Parent] Failed to fetch course:", courseError);
          if (
            courseError instanceof Error &&
            courseError.message.includes("ECONNRESET")
          ) {
            setError(
              "Kết nối bị gián đoạn khi tải khóa học. Vui lòng thử lại sau."
            );
          } else {
            setError("Không thể tải thông tin khóa học. Vui lòng thử lại.");
          }
          return;
        }

        // Xử lý course data
        let courseData = null;
        if (courseResponse?.success && courseResponse.data) {
          courseData = courseResponse.data;
        } else if (courseResponse?.data?.course) {
          courseData = courseResponse.data.course;
        } else if (courseResponse?.course) {
          courseData = courseResponse.course;
        } else if (courseResponse?._id) {
          courseData = courseResponse;
        }

        if (!courseData) {
          setError("Không tìm thấy thông tin khóa học");
          return;
        }

        setCourse(courseData);

        // Fetch lessons (optional - can continue without lessons)
        let lessonsData = [];
        try {
          const lessonsResponse = await getLessonsByCourse(courseId);
          console.log("✅ [Parent] Lessons data fetched successfully");

          // Xử lý lessons data
          if (lessonsResponse?.data?.lessons) {
            lessonsData = lessonsResponse.data.lessons;
          } else if (lessonsResponse?.lessons) {
            lessonsData = lessonsResponse.lessons;
          } else if (Array.isArray(lessonsResponse)) {
            lessonsData = lessonsResponse;
          }
        } catch (lessonsError) {
          console.warn(
            "⚠️ [Parent] Failed to fetch lessons, continuing without them:",
            lessonsError
          );
          // Continue with empty lessons rather than failing
          if (
            lessonsError instanceof Error &&
            lessonsError.message.includes("ECONNRESET")
          ) {
            console.warn(
              "📡 [Parent] Lessons fetch failed due to connection reset, but course will display"
            );
          }
          lessonsData = [];
        }

        setLessons(lessonsData);

        // Get premium status
        const status = getPremiumStatusInfo();
        setPremiumStatus({
          isPremium: status.isPremium,
          displayText: status.displayText,
        });

        console.log("🎉 [Parent] Course page data loading completed");
      } catch (err) {
        console.error(
          "❌ [Parent] Unexpected error fetching course data:",
          err
        );

        // Provide user-friendly error messages
        if (err instanceof Error) {
          if (err.message.includes("ECONNRESET")) {
            setError(
              "Kết nối bị gián đoạn. Vui lòng kiểm tra mạng và thử lại."
            );
          } else if (err.message.includes("timeout")) {
            setError("Tải dữ liệu quá lâu. Vui lòng thử lại.");
          } else if (
            err.message.includes("network") ||
            err.message.includes("fetch")
          ) {
            setError(
              "Lỗi kết nối mạng. Vui lòng kiểm tra internet và thử lại."
            );
          } else {
            setError(`Lỗi: ${err.message}`);
          }
        } else {
          setError("Không thể tải thông tin khóa học");
        }
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchCourseData();
    }
  }, [courseId]);

  const [loadingLessons, setLoadingLessons] = useState(false);

  // Fetch course details
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        console.log("Fetching course details for ID:", courseId);
        const response = await getCourseById(courseId);
        console.log("Course API Response:", response);

        // Handle different response structures
        let courseData = null;
        if (response && response.success && response.data) {
          // API trả về {success: true, data: courseObject}
          courseData = response.data;
        } else if (response && response.data && response.data.course) {
          courseData = response.data.course;
        } else if (response && response.course) {
          courseData = response.course;
        } else if (response && response._id) {
          courseData = response;
        }

        if (courseData) {
          setCourse(courseData);
        } else {
          console.error("No course data found in response:", response);
          setError("Không tìm thấy thông tin khóa học");
        }
      } catch (err) {
        console.error("Error fetching course:", err);
        setError("Không thể tải thông tin khóa học");
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchCourse();
    }
  }, [courseId]);

  // Fetch lessons for the course
  useEffect(() => {
    const fetchLessons = async () => {
      if (!course) return;

      try {
        setLoadingLessons(true);
        console.log("Fetching lessons for course:", courseId);
        const response = await getLessonsByCourse(courseId);
        console.log("Lessons API Response:", response);

        // Handle different response structures
        let lessonsData = [];
        if (response && response.data && response.data.lessons) {
          lessonsData = response.data.lessons;
        } else if (response && response.lessons) {
          lessonsData = response.lessons;
        } else if (response && Array.isArray(response)) {
          lessonsData = response;
        }

        setLessons(lessonsData);
      } catch (err) {
        console.error("Error fetching lessons:", err);
        // Don't set error for lessons, just log it
      } finally {
        setLoadingLessons(false);
      }
    };

    fetchLessons();
  }, [course, courseId]);

  // Fetch reviews for the course
  const fetchReviews = async () => {
    if (!courseId) return;

    try {
      setReviewsLoading(true);
      const reviewsResponse = await getReviewsByCourseId(courseId, 1, 10, 'star', 'asc');
      if (reviewsResponse?.success && reviewsResponse.data?.reviews) {
        setReviews(reviewsResponse.data.reviews);
      } else {
        setReviews([]);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
      setReviews([]);
    } finally {
      setReviewsLoading(false);
    }
  };

  useEffect(() => {
    if (courseId) {
      fetchReviews();
    }
  }, [courseId]);

  // Sample reviews for demo purposes (when API is not available)
  const sampleReviews: Review[] = [
    {
      _id: "sample1",
      courseId: {
        _id: courseId,
        title: course?.title || "",
        category: course?.category || "",
      },
      parentId: {
        _id: "parent1",
        fullName: "Nguyễn Thị Lan",
      },
      star: 5,
      content:
        "Khóa học rất bổ ích cho con em. Con học được nhiều điều thú vị và phương pháp giảng dạy rất sinh động.",
      createdAt: "2024-01-15T10:30:00.000Z",
      updatedAt: "2024-01-15T10:30:00.000Z",
    },
    {
      _id: "sample2",
      courseId: {
        _id: courseId,
        title: course?.title || "",
        category: course?.category || "",
      },
      parentId: {
        _id: "parent2",
        fullName: "Trần Văn Minh",
      },
      star: 4,
      content:
        "Chất lượng khóa học tốt, giúp con phát triển tư duy logic. Hy vọng sẽ có thêm nhiều bài học tương tác.",
      createdAt: "2024-01-10T14:20:00.000Z",
      updatedAt: "2024-01-10T14:20:00.000Z",
    },
  ];

  // Handle submit new review
  const handleSubmitReview = async () => {
    if (!newReview.content.trim() || newReview.star < 1 || newReview.star > 5) {
      alert("Vui lòng nhập nội dung đánh giá và chọn số sao hợp lệ (1-5)");
      return;
    }

    try {
      setIsSubmittingReview(true);

      // Get parent data from localStorage
      const parentData = localStorage.getItem("parentData");
      if (!parentData) {
        alert("Vui lòng đăng nhập để đánh giá khóa học");
        return;
      }

      const parsedParentData = JSON.parse(parentData);
      const parentId = parsedParentData.data?.id || parsedParentData.data?._id;

      if (!parentId) {
        alert("Không tìm thấy thông tin phụ huynh");
        return;
      }

      // Prepare review data according to API format
      const reviewData = {
        courseId: courseId,
        parentId: parentId,
        star: newReview.star,
        content: newReview.content.trim(),
      };

      console.log("Sending review data:", reviewData);

      const response = await createCourseReview(reviewData);

      if (response?.success) {
        // Reset form
        setNewReview({ star: 5, content: "" });

        // Refresh reviews
        await fetchReviews();

        toast("Đánh giá của bạn đã được gửi thành công!");
      }
    } catch (error) {
      console.error("Error submitting review:", error);

      // Provide more specific error messages
      if (error instanceof Error) {
        if (error.message.includes("404")) {
          alert(
            "Endpoint đánh giá không tìm thấy. Vui lòng liên hệ quản trị viên."
          );
        } else if (
          error.message.includes("401") ||
          error.message.includes("403")
        ) {
          alert("Bạn cần đăng nhập để có thể đánh giá khóa học.");
        } else if (error.message.includes("400")) {
          alert(
            "Dữ liệu đánh giá không hợp lệ. Vui lòng kiểm tra lại thông tin."
          );
        } else {
          alert(`Có lỗi xảy ra: ${error.message}`);
        }
      } else {
        alert("Có lỗi xảy ra khi gửi đánh giá. Vui lòng thử lại sau.");
      }
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Hàm cập nhật review
  const handleUpdateReview = async (reviewId: string) => {
    if (!editReview.content.trim() || editReview.star < 1 || editReview.star > 5) {
      alert("Vui lòng nhập nội dung đánh giá và chọn số sao hợp lệ (1-5)");
      return;
    }
    try {
      await updateCourseReview(reviewId, { star: editReview.star, content: editReview.content });
      setEditingReviewId(null);
      await fetchReviews();
      toast("Cập nhật đánh giá thành công!");
    } catch (error) {
      alert("Có lỗi khi cập nhật đánh giá");
    }
  };

  // Hàm xóa review
  const handleDeleteReview = async (reviewId: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa đánh giá này?")) return;
    try {
      await deleteCourseReview(reviewId);
      await fetchReviews();
      toast("Đã xóa đánh giá thành công!");
    } catch (error) {
      alert("Có lỗi khi xóa đánh giá");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f9fc] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8b5cf6] mx-auto mb-4"></div>
          <p className="text-[#6b7280]">Đang tải thông tin khóa học...</p>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-[#f8f9fc] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">
            {error || "Không tìm thấy khóa học"}
          </p>
          <Button
            onClick={() => window.history.back()}
            className="bg-[#8b5cf6] hover:bg-[#7c3aed] mr-4"
          >
            Quay lại
          </Button>
          <Button onClick={() => window.location.reload()} variant="outline">
            Thử lại
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fc]">
      {/* Main Content */}
      <main className="container mx-auto p-4 md:p-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Link
            href="/parent/courses"
            className="flex items-center text-[#6b7280] mb-6 hover:text-[#8b5cf6] group"
          >
            <ChevronLeft
              size={20}
              className="mr-1 group-hover:-translate-x-1 transition-transform"
            />
            Quay lại danh sách khóa học
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Course Details */}
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="border-none rounded-xl overflow-hidden shadow-md mb-8">
              <div className="h-[400px] relative">
                {!isVideoPlaying ? (
                  <>
                    <Image
                      src={
                        course.thumbnailUrl ||
                        `/placeholder.svg?height=400&width=800`
                      }
                      alt={course.title}
                      width={800}
                      height={400}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <Button
                        className="rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm p-6 group"
                        onClick={() => setIsVideoPlaying(true)}
                      >
                        <Play className="h-10 w-10 text-white fill-white group-hover:scale-110 transition-transform" />
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full bg-black flex items-center justify-center">
                    <div className="text-white text-center">
                      <p className="text-xl mb-4">Video Player Placeholder</p>
                      <Button
                        variant="outline"
                        className="text-white border-white hover:bg-white/10"
                        onClick={() => setIsVideoPlaying(false)}
                      >
                        Đóng video
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6 md:p-8">
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <div className="bg-[#f0e5fc] px-3 py-1 rounded-full text-sm text-[#8b5cf6] font-medium">
                    {course.category}
                  </div>
                  <div className="flex items-center text-[#6b7280] text-sm">
                    <User className="h-4 w-4 mr-1" />
                    <span>Độ tuổi: {course.ageGroup}</span>
                  </div>
                  <div className="flex items-center text-[#6b7280] text-sm">
                    <Star className="h-4 w-4 mr-1" />
                    <span>{course.pointsEarned} điểm</span>
                  </div>
                  {course.isPremium && (
                    <div className="bg-[#fef3c7] px-3 py-1 rounded-full text-sm text-[#f59e0b] font-medium">
                      Premium
                    </div>
                  )}
                </div>

                <h1 className="text-2xl md:text-3xl font-bold mb-4">
                  {course.title}
                </h1>

                <p className="text-[#4b5563] mb-6 text-lg">
                  {course.description}
                </p>

                <div className="flex flex-wrap gap-4 mb-6">
                  <div className="flex items-center gap-2 bg-[#f9fafb] px-4 py-2 rounded-full">
                    <BookOpen className="h-5 w-5 text-[#8b5cf6]" />
                    <span>{lessons.length} bài học</span>
                  </div>
                  <div className="flex items-center gap-2 bg-[#f9fafb] px-4 py-2 rounded-full">
                    <User className="h-5 w-5 text-[#8b5cf6]" />
                    <span>Độ tuổi {course.ageGroup}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-[#f9fafb] px-4 py-2 rounded-full">
                    <Clock className="h-5 w-5 text-[#8b5cf6]" />
                    <span>
                      Tổng thời gian:{" "}
                      {lessons.reduce(
                        (total, lesson) => total + lesson.duration,
                        0
                      )}{" "}
                      phút
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button className="bg-[#8b5cf6] hover:bg-[#7c3aed] rounded-full flex-1 py-6 text-lg">
                    {course.isPremium
                      ? "Mua khóa học Premium"
                      : "Bắt đầu học miễn phí"}
                  </Button>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="rounded-full flex items-center gap-2"
                    >
                      <Heart className="h-5 w-5" />
                      Yêu thích
                    </Button>
                    <Button
                      variant="outline"
                      className="rounded-full flex items-center gap-2"
                    >
                      <Share2 className="h-5 w-5" />
                      Chia sẻ
                    </Button>
                  </div>
                </div>
              </div>
            </Card>

            <Tabs defaultValue="curriculum" className="mb-8">
              <TabsList className="bg-white rounded-full p-1 w-full flex justify-between md:w-auto">
                <TabsTrigger value="curriculum" className="rounded-full">
                  Chương trình học
                </TabsTrigger>
                <TabsTrigger value="overview" className="rounded-full">
                  Tổng quan
                </TabsTrigger>
                <TabsTrigger value="instructor" className="rounded-full">
                  Giảng viên
                </TabsTrigger>
                <TabsTrigger value="reviews" className="rounded-full">
                  Đánh giá
                </TabsTrigger>
              </TabsList>

              <TabsContent value="curriculum" className="mt-6">
                <Card className="border-none rounded-xl shadow-md">
                  <CardContent className="p-0">
                    {loadingLessons ? (
                      <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8b5cf6]"></div>
                        <span className="ml-3 text-[#6b7280]">
                          Đang tải danh sách bài học...
                        </span>
                      </div>
                    ) : lessons.length > 0 ? (
                      lessons.map((lesson, index) => (
                        <motion.div
                          key={lesson._id}
                          className="flex items-center justify-between p-5 border-b last:border-b-0 hover:bg-[#f9fafb] transition-colors"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-[#f0e5fc] text-[#8b5cf6] flex items-center justify-center font-semibold">
                              {lesson.order || index + 1}
                            </div>
                            <div>
                              <h3 className="font-medium">{lesson.title}</h3>
                              <div className="flex items-center text-sm text-[#6b7280]">
                                <Clock className="h-4 w-4 mr-1" />
                                <span>{lesson.duration} phút</span>
                                {lesson.videoUrl && (
                                  <>
                                    <span className="mx-2">•</span>
                                    <Play className="h-4 w-4 mr-1" />
                                    <span>Video</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          {lesson.isPublished ? (
                            <Link
                              href={`/parent/courses/${courseId}/lessons/${lesson._id}`}
                              className="text-[#8b5cf6] hover:text-[#7c3aed] font-medium text-sm transition-colors"
                            >
                              Xem chi tiết →
                            </Link>
                          ) : (
                            <div className="w-8 h-8 rounded-full border border-[#e5e7eb] flex items-center justify-center">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="text-[#6b7280]"
                              >
                                <rect
                                  width="18"
                                  height="11"
                                  x="3"
                                  y="11"
                                  rx="2"
                                  ry="2"
                                />
                                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                              </svg>
                            </div>
                          )}
                        </motion.div>
                      ))
                    ) : (
                      <div className="text-center py-12">
                        <p className="text-[#6b7280]">
                          Chưa có bài học nào được thêm vào khóa học này
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="overview" className="mt-6">
                <Card className="border-none rounded-xl shadow-md">
                  <CardContent className="p-6 md:p-8">
                    <h2 className="text-xl font-semibold mb-6">
                      Về khóa học này
                    </h2>
                    <p className="text-[#4b5563] mb-6 leading-relaxed">
                      {course.description}
                    </p>

                    <h3 className="text-lg font-semibold mb-4 mt-8">
                      Thông tin khóa học
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                      <div className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-[#8b5cf6] mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-[#4b5563]">
                          Danh mục: {course.category}
                        </span>
                      </div>
                      <div className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-[#8b5cf6] mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-[#4b5563]">
                          Độ tuổi phù hợp: {course.ageGroup}
                        </span>
                      </div>
                      <div className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-[#8b5cf6] mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-[#4b5563]">
                          Số bài học: {lessons.length}
                        </span>
                      </div>
                      <div className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-[#8b5cf6] mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-[#4b5563]">
                          Điểm thưởng: {course.pointsEarned} điểm
                        </span>
                      </div>
                    </div>

                    <h3 className="text-lg font-semibold mb-4">Yêu cầu</h3>
                    <ul className="space-y-3 mb-8">
                      <li className="flex items-start">
                        <div className="h-2 w-2 rounded-full bg-[#8b5cf6] mt-2 mr-3"></div>
                        <span className="text-[#4b5563]">
                          Không cần kiến thức trước - phù hợp cho người mới bắt
                          đầu
                        </span>
                      </li>
                      <li className="flex items-start">
                        <div className="h-2 w-2 rounded-full bg-[#8b5cf6] mt-2 mr-3"></div>
                        <span className="text-[#4b5563]">
                          Máy tính hoặc tablet có kết nối internet
                        </span>
                      </li>
                      <li className="flex items-start">
                        <div className="h-2 w-2 rounded-full bg-[#8b5cf6] mt-2 mr-3"></div>
                        <span className="text-[#4b5563]">
                          Sự hỗ trợ của phụ huynh (khuyến khích)
                        </span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="instructor" className="mt-6">
                <Card className="border-none rounded-xl shadow-md">
                  <CardContent className="p-6 md:p-8">
                    <div className="flex flex-col sm:flex-row gap-6">
                      <div className="w-24 h-24 rounded-full overflow-hidden bg-[#f0e5fc] flex-shrink-0 border-4 border-white shadow-md">
                        <Image
                          src="/placeholder.svg?height=96&width=96"
                          alt="Instructor"
                          width={96}
                          height={96}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold mb-2">
                          {course.instructor.fullName}
                        </h2>
                        <p className="text-[#8b5cf6] mb-4">
                          Giảng viên chuyên nghiệp
                        </p>
                        <p className="text-[#4b5563] mb-6 leading-relaxed">
                          Giảng viên có kinh nghiệm giảng dạy với chuyên môn
                          trong các lĩnh vực:{" "}
                          {course.instructor.specializations?.join(", ") ||
                            "Đa dạng các môn học"}
                        </p>
                        <div className="flex items-center gap-8">
                          <div className="text-center">
                            <div className="font-bold text-2xl text-[#8b5cf6]">
                              5+
                            </div>
                            <div className="text-sm text-[#6b7280]">
                              Khóa học
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="font-bold text-2xl text-[#8b5cf6]">
                              100+
                            </div>
                            <div className="text-sm text-[#6b7280]">
                              Học viên
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="font-bold text-2xl text-[#8b5cf6]">
                              4.8
                            </div>
                            <div className="text-sm text-[#6b7280]">
                              Đánh giá
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reviews" className="mt-6">
                <div className="space-y-6">
                  {/* Create Review Section */}
                  <Card className="border-none rounded-xl shadow-md">
                    <CardContent className="p-6 md:p-8">
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <MessageCircle className="h-5 w-5 text-[#8b5cf6]" />
                        Viết đánh giá của bạn
                      </h3>

                      {/* Information Notice */}
                      <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm text-green-700">
                          <strong>Thông tin:</strong> Chia sẻ trải nghiệm của
                          bạn về khóa học này để giúp các phụ huynh khác có thêm
                          thông tin tham khảo.
                        </p>
                      </div>

                      {/* Star Rating */}
                      <div className="mb-4">
                        <label className="block text-sm font-medium mb-2">
                          Đánh giá sao
                        </label>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() =>
                                setNewReview({ ...newReview, star })
                              }
                              className="p-1 hover:scale-110 transition-transform"
                            >
                              <Star
                                className={`h-6 w-6 ${star <= newReview.star
                                  ? "text-yellow-400 fill-yellow-400"
                                  : "text-gray-300"
                                  }`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Review Content */}
                      <div className="mb-4">
                        <label className="block text-sm font-medium mb-2">
                          Nội dung đánh giá
                        </label>
                        <Textarea
                          value={newReview.content}
                          onChange={(e) =>
                            setNewReview({
                              ...newReview,
                              content: e.target.value,
                            })
                          }
                          placeholder="Chia sẻ trải nghiệm của bạn về khóa học này..."
                          className="resize-none"
                          rows={4}
                        />
                      </div>

                      {/* Submit Button */}
                      <Button
                        onClick={handleSubmitReview}
                        disabled={
                          !newReview.content.trim() || isSubmittingReview
                        }
                        className="bg-[#8b5cf6] hover:bg-[#7c3aed] rounded-full flex items-center gap-2"
                      >
                        {isSubmittingReview ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Đang gửi...
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4" />
                            Gửi đánh giá
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Reviews List */}
                  <Card className="border-none rounded-xl shadow-md">
                    <CardContent className="p-6 md:p-8">
                      <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                        <ThumbsUp className="h-5 w-5 text-[#8b5cf6]" />
                        Đánh giá từ phụ huynh khác ({reviews.length})
                      </h3>

                      {reviewsLoading ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8b5cf6]"></div>
                          <span className="ml-3 text-[#6b7280]">
                            Đang tải đánh giá...
                          </span>
                        </div>
                      ) : reviews.length > 0 ? (
                        <div className="space-y-6">
                          {reviews.map((review, index) => (
                            <motion.div
                              key={review._id}
                              className="border-b border-gray-200 pb-6 last:border-b-0 last:pb-0"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3, delay: index * 0.1 }}
                            >
                              <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-full bg-[#f0e5fc] flex items-center justify-center">
                                  <User className="h-5 w-5 text-[#8b5cf6]" />
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center justify-between mb-2">
                                    <div>
                                      <h4 className="font-medium text-gray-900">
                                        {review.parentId?.fullName ||
                                          review.kidId?.fullName ||
                                          "Người dùng ẩn danh"}
                                      </h4>
                                      <div className="flex items-center gap-2">
                                        <div className="flex">
                                          {[1, 2, 3, 4, 5].map((star) => (
                                            <Star
                                              key={star}
                                              className={`h-4 w-4 ${star <= review.star
                                                ? "text-yellow-400 fill-yellow-400"
                                                : "text-gray-300"
                                                }`}
                                            />
                                          ))}
                                        </div>
                                        <span className="text-sm text-gray-500">
                                          {new Date(
                                            review.createdAt
                                          ).toLocaleDateString("vi-VN")}
                                        </span>
                                      </div>
                                    </div>
                                    {/* Nút Sửa/Xóa nếu đúng parentId */}
                                    {parentId && review.parentId?._id === parentId && (
                                      <div className="flex gap-2">
                                        <Button size="sm" variant="outline" onClick={() => {
                                          setEditingReviewId(review._id);
                                          setEditReview({ star: review.star, content: review.content });
                                        }}>Sửa</Button>
                                        <Button size="sm" variant="destructive" onClick={() => handleDeleteReview(review._id)}>Xóa</Button>
                                      </div>
                                    )}
                                  </div>
                                  {/* Nếu đang chỉnh sửa review này */}
                                  {editingReviewId === review._id ? (
                                    <div className="mb-2">
                                      <div className="flex gap-1 mb-2">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                          <button key={star} type="button" onClick={() => setEditReview({ ...editReview, star })}>
                                            <Star className={`h-5 w-5 ${star <= editReview.star ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`} />
                                          </button>
                                        ))}
                                      </div>
                                      <Textarea
                                        value={editReview.content}
                                        onChange={e => setEditReview({ ...editReview, content: e.target.value })}
                                        rows={3}
                                        className="mb-2"
                                      />
                                      <div className="flex gap-2">
                                        <Button size="sm" onClick={() => handleUpdateReview(review._id)}>Lưu</Button>
                                        <Button size="sm" variant="outline" onClick={() => setEditingReviewId(null)}>Hủy</Button>
                                      </div>
                                    </div>
                                  ) : (
                                    <p className="text-gray-700 leading-relaxed">{review.content}</p>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                          <h4 className="text-lg font-medium text-gray-500 mb-2">
                            Chưa có đánh giá nào
                          </h4>
                          <p className="text-gray-400">
                            Hãy là người đầu tiên đánh giá khóa học này!
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="border-none rounded-xl shadow-md sticky top-4">
              <CardContent className="p-6">
                {(() => {
                  const courseAccessInfo = checkCourseAccess(course);
                  const canAccess = canAccessCourse(course);

                  return (
                    <>
                      <div className="mb-6">
                        {/* Premium Status Badge */}
                        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#8b5cf6]/10 to-[#7c3aed]/10 rounded-full px-4 py-2 mb-4">
                          <User className="h-4 w-4 text-[#8b5cf6]" />
                          <span className="text-sm font-medium text-[#8b5cf6]">
                            {premiumStatus.displayText}
                          </span>
                        </div>

                        {/* Course Price Display */}
                        <div className="text-3xl font-bold text-[#1e1e1e] mb-2">
                          {course.isPremium ? (
                            canAccess ? (
                              <span className="text-[#10b981] flex items-center gap-2">
                                <CheckCircle className="h-6 w-6" />
                                Có quyền truy cập
                              </span>
                            ) : (
                              <span className="text-[#f59e0b] flex items-center gap-2">
                                <Lock className="h-6 w-6" />
                                Cần Premium
                              </span>
                            )
                          ) : (
                            <span className="text-[#10b981]">Miễn phí</span>
                          )}
                        </div>

                        {/* Course access message */}
                        <p className="text-[#6b7280] text-sm mb-4">
                          {courseAccessInfo.message}
                        </p>
                      </div>

                      <div className="space-y-5 mb-8">
                        <div className="flex items-start">
                          <CheckCircle className="h-5 w-5 text-[#8b5cf6] mr-3 mt-0.5" />
                          <div>
                            <p className="font-medium">
                              Truy cập đầy đủ khóa học
                            </p>
                            <p className="text-sm text-[#6b7280]">
                              {lessons.length} bài học
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <CheckCircle className="h-5 w-5 text-[#8b5cf6] mr-3 mt-0.5" />
                          <div>
                            <p className="font-medium">Thời gian truy cập</p>
                            <p className="text-sm text-[#6b7280]">Trọn đời</p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <CheckCircle className="h-5 w-5 text-[#8b5cf6] mr-3 mt-0.5" />
                          <div>
                            <p className="font-medium">Hoạt động tương tác</p>
                            <p className="text-sm text-[#6b7280]">
                              Trò chơi và bài kiểm tra
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <CheckCircle className="h-5 w-5 text-[#8b5cf6] mr-3 mt-0.5" />
                          <div>
                            <p className="font-medium">Điểm thưởng</p>
                            <p className="text-sm text-[#6b7280]">
                              {course.pointsEarned} điểm
                            </p>
                          </div>
                        </div>
                      </div>

                      {canAccess ? (
                        <Button className="w-full bg-[#8b5cf6] hover:bg-[#7c3aed] rounded-full py-6 text-lg mb-4">
                          {courseAccessInfo.actionText}
                        </Button>
                      ) : (
                        <Button
                          onClick={() => redirectToPremiumUpgrade()}
                          className="w-full bg-gradient-to-r from-[#FFD700] to-[#FFA500] hover:from-[#FFA500] hover:to-[#FF8C00] text-black rounded-full py-6 text-lg mb-4 flex items-center justify-center gap-2"
                        >
                          <Crown className="h-5 w-5" />
                          {courseAccessInfo.actionText}
                        </Button>
                      )}

                      <p className="text-xs text-[#6b7280] text-center">
                        {canAccess
                          ? "Đảm bảo hoàn tiền trong 30 ngày"
                          : "Nâng cấp để truy cập toàn bộ khóa học Premium"}
                      </p>
                    </>
                  );
                })()}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Related Courses */}
        <motion.div
          className="mt-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h2 className="text-2xl font-bold text-[#1e1e1e] border-l-4 border-[#8b5cf6] pl-3 mb-8">
            You May Also Like
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {relatedCourses.map((course, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <Card className="border-none rounded-xl shadow-md overflow-hidden h-full">
                  <div className="h-44 relative overflow-hidden">
                    <Image
                      src={`/placeholder.svg?height=176&width=352`}
                      alt={course.title}
                      width={352}
                      height={176}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                    />
                    <button className="absolute top-3 right-3 bg-white/30 backdrop-blur-sm p-2 rounded-full hover:bg-white/50 transition-colors">
                      <Heart className="h-4 w-4 text-white" />
                    </button>
                  </div>
                  <CardContent className="p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="bg-[#f0e5fc] px-2 py-1 rounded-full text-xs text-[#8b5cf6] font-medium">
                        {course.category}
                      </div>
                      <div className="text-[#6b7280] text-xs flex items-center">
                        <Star className="h-3 w-3 text-[#f59e0b] fill-[#f59e0b] mr-1" />
                        {course.rating}
                      </div>
                    </div>
                    <Link href={`/parent/courses/${course.id}`}>
                      <h3 className="font-semibold mb-3 hover:text-[#8b5cf6] transition-colors line-clamp-2">
                        {course.title}
                      </h3>
                    </Link>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-[#6b7280]">
                        <BookOpen size={16} className="mr-1" />
                        <span>{course.lessons} lessons</span>
                      </div>
                      <div className="font-bold text-[#8b5cf6]">
                        ${course.price}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
const courses = [
  {
    id: 1,
    title: "Complete Mathematics for Elementary Students",
    description:
      "A comprehensive course covering all essential math concepts for elementary school students with interactive exercises and games.",
    longDescription:
      "This comprehensive mathematics course is designed specifically for elementary school students. It covers all essential math concepts including numbers, operations, geometry, measurement, and data analysis. Through interactive lessons, engaging exercises, and fun games, students will develop a strong foundation in mathematics that will serve them throughout their academic journey. The course is structured to build confidence and foster a love for mathematics.",
    category: "Mathematics",
    rating: 4.9,
    reviewCount: 245,
    lessons: 24,
    duration: "12 hours",
    price: 49.99,
    ageRange: "6-10",
    students: 2500,
    accessPeriod: "Lifetime",
    learningOutcomes: [
      "Master basic arithmetic operations (addition, subtraction, multiplication, division)",
      "Understand place value and number systems",
      "Solve word problems using mathematical reasoning",
      "Learn basic geometry concepts including shapes and measurements",
      "Develop skills in data interpretation using graphs and charts",
      "Build a strong foundation for future mathematical learning",
    ],
    requirements: [
      "No prior knowledge required - perfect for beginners",
      "Basic reading skills recommended",
      "A computer or tablet with internet connection",
    ],
    targetAudience: [
      "Elementary school students aged 6-10",
      "Parents looking to support their child's math education",
      "Teachers seeking supplementary materials for their students",
      "Homeschooling families",
    ],
    instructor: {
      name: "Sarah Johnson",
      title: "Mathematics Education Specialist",
      bio: "Sarah has been teaching mathematics to elementary students for over 15 years. She specializes in making complex concepts easy to understand through interactive and engaging teaching methods. She holds a Master's degree in Education with a focus on mathematics instruction.",
      courses: 15,
      students: 10000,
      rating: 4.8,
    },
  },
];

const lessons = [
  {
    title: "Introduction to Numbers",
    duration: "30 min",
    preview: true,
  },
  {
    title: "Addition and Subtraction Basics",
    duration: "45 min",
    preview: true,
  },
  {
    title: "Multiplication Tables",
    duration: "60 min",
    preview: false,
  },
  {
    title: "Division Concepts",
    duration: "45 min",
    preview: false,
  },
  {
    title: "Fractions Introduction",
    duration: "50 min",
    preview: false,
  },
  {
    title: "Geometry: Shapes and Angles",
    duration: "40 min",
    preview: false,
  },
  {
    title: "Measurement Units",
    duration: "35 min",
    preview: false,
  },
  {
    title: "Word Problems",
    duration: "55 min",
    preview: false,
  },
];

const relatedCourses = [
  {
    id: 7,
    title: "Multiplication & Division Mastery",
    category: "Mathematics",
    rating: 4.9,
    lessons: 16,
    price: 39.99,
  },
  {
    id: 2,
    title: "Science Experiments at Home",
    category: "Science",
    rating: 4.8,
    lessons: 18,
    price: 39.99,
  },
  {
    id: 8,
    title: "Vocabulary Building for Kids",
    category: "Language",
    rating: 4.7,
    lessons: 22,
    price: 42.99,
  },
];
