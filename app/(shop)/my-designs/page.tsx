'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, ShoppingCart, Trash2, Eye, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api-client';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { getImageUrl } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface CustomProductStone {
  stoneId: number;
  stoneName: string;
  stoneImageUrl: string;
  quantity: number;
  position: number;
  priceAtTime: number;
}

interface CustomProduct {
  id: number;
  name: string;
  description?: string;
  previewImageUrl?: string;
  totalPrice: number;
  notes?: string;
  stones: CustomProductStone[];
  createdAt: string;
}

export default function MyDesignsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<CustomProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [addingToCart, setAddingToCart] = useState<number | null>(null);

  useEffect(() => {
    fetchMyDesigns();
  }, []);

  const fetchMyDesigns = async () => {
    try {
      const response = await apiClient.get('/customproducts/my');
      setProducts(response.data);
    } catch (error: any) {
      if (error.response?.status === 401) {
        toast.error('Vui lòng đăng nhập');
        router.push('/login');
      } else {
        toast.error('Không thể tải thiết kế');
      }
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId: number) => {
    setAddingToCart(productId);
    try {
      await apiClient.post('/cart/custom-items', {
        customProductId: productId,
        quantity: 1
      });
      toast.success('Đã thêm vào giỏ hàng!');
    } catch (error) {
      toast.error('Không thể thêm vào giỏ hàng');
    } finally {
      setAddingToCart(null);
    }
  };

  const deleteProduct = async (productId: number) => {
    try {
      await apiClient.delete(`/customproducts/${productId}`);
      setProducts(products.filter(p => p.id !== productId));
      toast.success('Đã xóa thiết kế');
    } catch (error) {
      toast.error('Không thể xóa thiết kế');
    } finally {
      setDeleteId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-purple-500" />
            Thiết Kế Của Tôi
          </h1>
          <p className="text-muted-foreground">
            Quản lý các vòng tay bạn đã thiết kế
          </p>
        </div>

        {/* Empty State */}
        {products.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Sparkles className="w-16 h-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                Chưa có thiết kế nào
              </h3>
              <p className="text-muted-foreground mb-6">
                Bắt đầu tạo vòng tay độc nhất của riêng bạn
              </p>
              <Button onClick={() => router.push('/customize')}>
                Tạo Thiết Kế Mới
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Action Bar */}
            <div className="flex justify-between items-center mb-6">
              <p className="text-muted-foreground">
                {products.length} thiết kế
              </p>
              <Button onClick={() => router.push('/customize')}>
                Tạo Thiết Kế Mới
              </Button>
            </div>

            {/* Products Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <Card key={product.id} className="overflow-hidden">
                  {/* Preview Image */}
                    {product.previewImageUrl && (
                      <div className="relative h-48 bg-gradient-to-br from-purple-100 to-pink-100">
                        <Image
                          src={getImageUrl(product.previewImageUrl)}
                          alt={product.name}
                          fill
                          className="object-contain p-4"
                        />
                      </div>
                    )}

                  <CardHeader>
                    <CardTitle className="line-clamp-1">
                      {product.name}
                    </CardTitle>
                    {product.description && (
                      <CardDescription className="line-clamp-2">
                        {product.description}
                      </CardDescription>
                    )}
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Stones */}
                    <div>
                      <p className="text-sm font-medium mb-2">
                        Các loại đá ({product.stones.length}):
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {product.stones.map((stone, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {stone.stoneName} x{stone.quantity}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Notes */}
                    {product.notes && (
                      <div>
                        <p className="text-sm font-medium mb-1">Ghi chú:</p>
                        <p className="text-sm text-muted-foreground">
                          {product.notes}
                        </p>
                      </div>
                    )}

                    {/* Price */}
                    <div className="pt-4 border-t">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-sm text-muted-foreground">
                          Tổng giá:
                        </span>
                        <span className="text-xl font-bold text-primary">
                          {product.totalPrice.toLocaleString('vi-VN')}đ
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button
                          className="flex-1"
                          onClick={() => addToCart(product.id)}
                          disabled={addingToCart === product.id}
                        >
                          {addingToCart === product.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <ShoppingCart className="w-4 h-4" />
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => window.open(
                            getImageUrl(product.previewImageUrl),
                            '_blank'
                          )}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setDeleteId(product.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Created Date */}
                    <p className="text-xs text-muted-foreground text-center">
                      Tạo ngày {new Date(product.createdAt).toLocaleDateString('vi-VN')}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
              <AlertDialogDescription>
                Bạn có chắc muốn xóa thiết kế này? Hành động này không thể hoàn tác.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Hủy</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteId && deleteProduct(deleteId)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Xóa
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
