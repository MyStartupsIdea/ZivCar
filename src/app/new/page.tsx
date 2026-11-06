import { ListingForm } from "@/components/ListingForm";

export const metadata = {
  title: "Разместить объявление",
  description: "Добавьте фотографии, название и описание — карточка готова.",
};

export default function NewListingPage() {
  return <ListingForm />;
}
