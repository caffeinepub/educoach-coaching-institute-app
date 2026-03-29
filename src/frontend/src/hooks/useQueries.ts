import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Course, LiveClass, StudyMaterial } from "../backend.d";
import { useActor } from "./useActor";

export function useAllCourses() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["courses"],
    queryFn: async () => {
      if (!actor) return [];
      const result = await actor.getAllCoursesSortedByTitle();
      return result.map(([id, course]) => ({ id, ...course }));
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAllLiveClasses() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["liveClasses"],
    queryFn: async () => {
      if (!actor) return [];
      const result = await actor.getAllLiveClassesSortedByTime();
      return result.map(([id, cls]) => ({ id, ...cls }));
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAllStudyMaterials() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["studyMaterials"],
    queryFn: async () => {
      if (!actor) return [];
      const result = await actor.getAllStudyMaterialsSortedByTitle();
      return result.map(([id, mat]) => ({ id, ...mat }));
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAllTestSeries() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["testSeries"],
    queryFn: async () => {
      if (!actor) return [];
      const result = await actor.getAllTestSeriesSortedByTitle();
      return result.map(([id, test]) => ({ id, ...test }));
    },
    enabled: !!actor && !isFetching,
  });
}

export function useMyProgress() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["myProgress"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getMyProgress();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUserProfile() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["userProfile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useEnrollCourse() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (courseId: bigint) => {
      if (!actor) throw new Error("No actor");
      return actor.enrollInCourse(courseId);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["myProgress"] }),
  });
}

export function useInitSampleData() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("No actor");
      return actor.initializeSampleData();
    },
    onSuccess: () => qc.invalidateQueries(),
  });
}

export function useAddCourse() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (course: Course) => {
      if (!actor) throw new Error("No actor");
      return actor.addCourse(course);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["courses"] }),
  });
}

export function useUpdateCourse() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      courseId,
      course,
    }: { courseId: bigint; course: Course }) => {
      if (!actor) throw new Error("No actor");
      return actor.updateCourse(courseId, course);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["courses"] }),
  });
}

export function useDeleteCourse() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (courseId: bigint) => {
      if (!actor) throw new Error("No actor");
      return actor.deleteCourse(courseId);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["courses"] }),
  });
}

export function useAddLiveClass() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (liveClass: LiveClass) => {
      if (!actor) throw new Error("No actor");
      return actor.addLiveClass(liveClass);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["liveClasses"] }),
  });
}

export function useUpdateLiveClass() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      classId,
      liveClass,
    }: { classId: bigint; liveClass: LiveClass }) => {
      if (!actor) throw new Error("No actor");
      return actor.updateLiveClass(classId, liveClass);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["liveClasses"] }),
  });
}

export function useDeleteLiveClass() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (classId: bigint) => {
      if (!actor) throw new Error("No actor");
      return actor.deleteLiveClass(classId);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["liveClasses"] }),
  });
}

export function useAddStudyMaterial() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (material: StudyMaterial) => {
      if (!actor) throw new Error("No actor");
      return actor.addStudyMaterial(material);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["studyMaterials"] }),
  });
}

export function useUpdateStudyMaterial() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      materialId,
      material,
    }: { materialId: bigint; material: StudyMaterial }) => {
      if (!actor) throw new Error("No actor");
      return actor.updateStudyMaterial(materialId, material);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["studyMaterials"] }),
  });
}

export function useDeleteStudyMaterial() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (materialId: bigint) => {
      if (!actor) throw new Error("No actor");
      return actor.deleteStudyMaterial(materialId);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["studyMaterials"] }),
  });
}

export function useAddTestSeries() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (series: import("../backend.d").TestSeries) => {
      if (!actor) throw new Error("No actor");
      return actor.addTestSeries(series);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["testSeries"] }),
  });
}

export function useUpdateTestSeries() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      testId,
      series,
    }: { testId: bigint; series: import("../backend.d").TestSeries }) => {
      if (!actor) throw new Error("No actor");
      return actor.updateTestSeries(testId, series);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["testSeries"] }),
  });
}

export function useDeleteTestSeries() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (testId: bigint) => {
      if (!actor) throw new Error("No actor");
      return actor.deleteTestSeries(testId);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["testSeries"] }),
  });
}

export function useAllStudentProgress() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["studentProgress"],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).getAllStudentProgress();
    },
    enabled: !!actor && !isFetching,
  });
}
