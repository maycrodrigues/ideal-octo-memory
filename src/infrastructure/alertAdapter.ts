import Swal from "sweetalert2";

export const AlertAdapter = {
  success: (title: string, text?: string) => {
    return Swal.fire({
      icon: "success",
      title,
      text,
      confirmButtonColor: "#3b82f6",
    });
  },
  error: (title: string, text?: string) => {
    return Swal.fire({
      icon: "error",
      title,
      text,
      confirmButtonColor: "#3b82f6",
    });
  },
  confirm: async (title: string, text?: string) => {
    const result = await Swal.fire({
      icon: "warning",
      title,
      text,
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#9ca3af",
      confirmButtonText: "Sim, excluir!",
      cancelButtonText: "Cancelar",
    });
    return result.isConfirmed;
  },
  loading: (title: string) => {
    Swal.fire({
      title,
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });
  },
  close: () => {
    Swal.close();
  },
};
