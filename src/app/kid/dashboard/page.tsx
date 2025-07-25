"use client"

import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, Clock, Star } from "lucide-react"

export default function KidDashboard() {
  return (
    <div>
      {/* Welcome Section */}
      <div className="bg-white rounded-xl p-6 mb-8 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-[#10b981] rounded-full flex items-center justify-center">
            <Image
              src="/placeholder.svg?height=48&width=48"
              alt="Kid avatar"
              width={48}
              height={48}
              className="rounded-full"
            />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Hi, Alex!</h1>
            <p className="text-[#6b7280]">
              Ready to learn something new today?
            </p>
          </div>
        </div>
      </div>

      {/* Continue Learning */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">Continue Learning</h2>
        <Card className="border-none shadow-sm overflow-hidden">
          <div className="h-40 bg-[#d9d9d9] relative">
            <Image
              src="/placeholder.svg?height=160&width=640"
              alt="Course thumbnail"
              width={640}
              height={160}
              className="w-full h-full object-cover"
            />
          </div>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-2">Mathematics for Kids</h3>
            <div className="flex items-center text-sm text-[#6b7280] mb-3">
              <Clock size={16} className="mr-1" />
              <span>Lesson 5: Multiplication</span>
            </div>
            <div className="w-full bg-[#e5e7eb] h-2 rounded-full">
              <div
                className="bg-[#10b981] h-2 rounded-full"
                style={{ width: "65%" }}
              ></div>
            </div>
            <div className="flex justify-between items-center mt-2 text-sm">
              <span className="text-[#6b7280]">Progress</span>
              <span className="font-medium">65%</span>
            </div>
            <Button className="w-full mt-4 bg-[#10b981] hover:bg-[#059669]">
              <Link href="/kid/courses/1/lessons/5">Continue</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* My Courses */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">My Courses</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {kidCourses.map((course, index) => (
            <Card key={index} className="border-none shadow-sm overflow-hidden">
              <div className="h-32 bg-[#d9d9d9] relative">
                <Image
                  src={`/placeholder.svg?height=128&width=256`}
                  alt={course.title}
                  width={256}
                  height={128}
                  className="w-full h-full object-cover"
                />
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-2">{course.title}</h3>
                <div className="flex items-center justify-between text-sm mb-2">
                  <div className="flex items-center text-[#6b7280]">
                    <BookOpen size={16} className="mr-1" />
                    <span>{course.lessons} lessons</span>
                  </div>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-[#f59e0b] fill-[#f59e0b] mr-1" />
                    <span>{course.stars} stars</span>
                  </div>
                </div>
                <div className="w-full bg-[#e5e7eb] h-2 rounded-full">
                  <div
                    className="bg-[#10b981] h-2 rounded-full"
                    style={{ width: `${course.progress}%` }}
                  ></div>
                </div>
                <Button className="w-full mt-4 bg-[#10b981] hover:bg-[#059669]">
                  <Link href={`/kid/courses/${course.id}`}>Play</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Daily Challenge */}
      <div>
        <h2 className="text-xl font-bold mb-4">Daily Challenge</h2>
        <Card className="border-none shadow-sm overflow-hidden bg-gradient-to-r from-[#10b981] to-[#059669] text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Math Challenge</h3>
              <div className="flex items-center">
                <Star className="h-5 w-5 text-[#f59e0b] fill-[#f59e0b] mr-1" />
                <span>5 stars</span>
              </div>
            </div>
            <p className="mb-4">
              Complete today&apos;s math puzzle and earn extra stars!
            </p>
            <Button className="bg-white text-[#10b981] hover:bg-white/90">
              <Link href="/kid/challenges/daily">Start Challenge</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

const kidCourses = [
  {
    id: 1,
    title: "Mathematics for Kids",
    lessons: 12,
    stars: 45,
    progress: 65,
  },
  {
    id: 2,
    title: "English Vocabulary",
    lessons: 18,
    stars: 32,
    progress: 30,
  },
  {
    id: 3,
    title: "Science Experiments",
    lessons: 15,
    stars: 50,
    progress: 100,
  },
];
