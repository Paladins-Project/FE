"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    Award,
    BookOpen,
    Calendar,
    Edit,
    Mail,
    MapPin,
    Phone,
    User,
    Shield,
    CreditCard,
    X,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from "react";
import { AddChild } from "@/components/addchild";

export default function ParentProfile() {
    const [childrenList, setChildrenList] = useState(children);
    const [parentData, setParentData] = useState(null);
    const [kidsData, setKidsData] = useState([]);
    const [loading, setLoading] = useState(true);

    // Load dữ liệu từ localStorage khi component mount
    useEffect(() => {
        try {
            const storedParentData = localStorage.getItem('parentData');
            const storedKidsData = localStorage.getItem('kidsData');
            
            if (storedParentData) {
                setParentData(JSON.parse(storedParentData));
            }
            
            if (storedKidsData) {
                const kidsArray = JSON.parse(storedKidsData);
                setKidsData(kidsArray);
                
                // Cập nhật childrenList với dữ liệu thực từ API
                const updatedChildren = kidsArray.map((kid: any) => ({
                    name: kid.data?.fullName || kid.data?.name || 'Unknown',
                    age: kid.data?.age || 0,
                    courses: 0 // Có thể tính từ dữ liệu courses nếu có
                }));
                setChildrenList(updatedChildren);
            }
        } catch (error) {
            console.error('Error loading stored data:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    const handleAddChild = (child: {
        name: string;
        age: string;
        gender: string;
        avatar: string;
    }) => {
        // Add the new child to the list
        const newChildWithCourses = {
            name: child.name,
            age: parseInt(child.age) || 0,
            courses: 0,
        };
        
        setChildrenList([...childrenList, newChildWithCourses]);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#10b981] mx-auto mb-4"></div>
                    <p>Đang tải dữ liệu...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f5f5f5]">
            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-2xl font-bold text-[#1e1e1e]">Hồ sơ của tôi</h1>
                    <Button variant="outline" className="flex items-center gap-2">
                        <Edit size={16} />
                        Chỉnh sửa hồ sơ
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Profile Card */}
                    <Card className="border-none shadow-sm">
                        <CardContent className="p-6">
                            <div className="flex flex-col items-center">
                                <div className="w-24 h-24 rounded-full overflow-hidden bg-[#d9d9d9] mb-4">
                                    <Image
                                        src={parentData?.data?.image || parentData?.image || "/placeholder.svg?height=96&width=96"}
                                        alt="Profile"
                                        width={96}
                                        height={96}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <h2 className="text-xl font-semibold">
                                    {parentData?.data?.fullName || 'Chưa có tên'}
                                </h2>
                                <p className="text-[#6b7280] mb-4">Phụ huynh</p>

                                <div className="w-full space-y-4 mt-4">
                                    <div className="flex items-center gap-3">
                                        <Mail className="h-5 w-5 text-[#6b7280]" />
                                        <span>{parentData?.email || 'Chưa có email'}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Phone className="h-5 w-5 text-[#6b7280]" />
                                        <span>{parentData?.data?.phoneNumber || 'Chưa có số điện thoại'}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <MapPin className="h-5 w-5 text-[#6b7280]" />
                                        <span>{parentData?.data?.address || 'Chưa có địa chỉ'}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Calendar className="h-5 w-5 text-[#6b7280]" />
                                        <span>
                                            Tham gia: {parentData?.data?.createdAt ? 
                                                new Date(parentData.data.createdAt).toLocaleDateString('vi-VN', {
                                                    year: 'numeric',
                                                    month: 'long'
                                                }) : 'Chưa xác định'
                                            }
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Main Content */}
                    <div className="lg:col-span-2">
                        <Tabs defaultValue="children" className="w-full">
                            <TabsList className="bg-white">
                                <TabsTrigger value="children">Con của tôi</TabsTrigger>
                                <TabsTrigger value="subscription">Gói đăng ký</TabsTrigger>
                                <TabsTrigger value="security">Bảo mật</TabsTrigger>
                            </TabsList>

                            <TabsContent value="children" className="mt-6">
                                <Card className="border-none shadow-sm">
                                    <CardContent className="p-6">
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="text-lg font-semibold">
                                                Danh sách con ({childrenList.length})
                                            </h3>
                                            <AddChild onAddChild={handleAddChild} />
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {childrenList.length > 0 ? childrenList.map((child, index) => (
                                                <div
                                                    key={index}
                                                    className="bg-white border rounded-lg p-4 flex items-center gap-4"
                                                >
                                                    <div className="w-16 h-16 rounded-full overflow-hidden bg-[#d9d9d9]">
                                                        <Image
                                                            src="/placeholder.svg?height=64&width=64"
                                                            alt={child.name}
                                                            width={64}
                                                            height={64}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-medium">{child.name}</h4>
                                                        <p className="text-sm text-[#6b7280]">{child.age} tuổi</p>
                                                        <div className="flex items-center text-sm text-[#6b7280] mt-1">
                                                            <BookOpen size={14} className="mr-1" />
                                                            <span>{child.courses} khóa học</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )) : (
                                                <div className="col-span-2 text-center py-8 text-gray-500">
                                                    <p>Chưa có thông tin con. Hãy thêm con để bắt đầu!</p>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="subscription" className="mt-6">
                                <Card className="border-none shadow-sm">
                                    <CardContent className="p-6">
                                        <h3 className="text-lg font-semibold mb-4">
                                            Gói đăng ký hiện tại
                                        </h3>
                                        <div className="bg-[#8b5cf6] text-white rounded-lg p-6">
                                            <div className="flex items-center gap-4 mb-4">
                                                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                                                    <CreditCard className="h-6 w-6" />
                                                </div>
                                                <div>
                                                    <h4 className="font-medium text-lg">
                                                        {parentData?.data?.subscriptionType === 'free' ? 'Gói Miễn phí' : 
                                                         parentData?.data?.subscriptionType === 'premium' ? 'Gói Premium' : 
                                                         'Gói Cơ bản'}
                                                    </h4>
                                                    <p className="text-white/80">
                                                        {parentData?.data?.subscriptionExpiry ? 
                                                            `Còn hạn đến: ${new Date(parentData.data.subscriptionExpiry).toLocaleDateString('vi-VN')}` :
                                                            'Không giới hạn thời gian'
                                                        }
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <Shield className="h-4 w-4" />
                                                    <span>Truy cập không giới hạn</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <User className="h-4 w-4" />
                                                    <span>Quản lý tối đa 3 con</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Award className="h-4 w-4" />
                                                    <span>Chứng chỉ hoàn thành</span>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="security" className="mt-6">
                                <Card className="border-none shadow-sm">
                                    <CardContent className="p-6">
                                        <h3 className="text-lg font-semibold mb-4">
                                            Bảo mật tài khoản
                                        </h3>
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between p-4 border rounded-lg">
                                                <div>
                                                    <h4 className="font-medium">Đổi mật khẩu</h4>
                                                    <p className="text-sm text-[#6b7280]">Cập nhật mật khẩu của bạn</p>
                                                </div>
                                                <Button variant="outline">Thay đổi</Button>
                                            </div>
                                            <div className="flex items-center justify-between p-4 border rounded-lg">
                                                <div>
                                                    <h4 className="font-medium">Xác thực hai yếu tố</h4>
                                                    <p className="text-sm text-[#6b7280]">Bảo vệ tài khoản của bạn</p>
                                                </div>
                                                <Button variant="outline">Bật</Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </div>
        </div>
    );
}

const children = [
    {
        name: "Nguyễn Văn B",
        age: 8,
        courses: 3,
    },
    {
        name: "Nguyễn Thị C",
        age: 6,
        courses: 2,
    },
];
